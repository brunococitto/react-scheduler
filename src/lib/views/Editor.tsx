import { Fragment, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import { randomBytes } from "crypto";
import { addHours } from "date-fns";
import { EditorDatePicker } from "../components/inputs/DatePicker";
import { EditorInput } from "../components/inputs/Input";
import { SelectedRange } from "../context/state/stateContext";
import { useAppState } from "../hooks/useAppState";
import {
  EventActions,
  FieldInputProps,
  FieldProps,
  InputTypes,
  ProcessedEvent,
  SchedulerHelpers,
} from "../Scheduler";
import { EditorSelect } from "../components/inputs/SelectInput";

export type StateItem = {
  value: any;
  validity: boolean;
  type: InputTypes;
  config?: FieldInputProps;
};

type StateEvent = (ProcessedEvent & SelectedRange) | Record<string, any>;

const initialState = (
  fields: FieldProps[],
  event?: StateEvent
): Record<string, StateItem> => {
  const customFields = {} as Record<string, StateItem>;
  for (const field of fields) {
    customFields[field.name] = {
      value: event?.[field.name] || field.default || "",
      validity: field.config?.required
        ? !!event?.[field.name] || !!field.default
        : true,
      type: field.type,
      config: field.config,
    };
  }

  return {
    event_id: {
      value: event?.event_id || null,
      validity: true,
      type: "hidden",
    },
    title: {
      value: event?.title || "",
      validity: !!event?.title,
      type: "input",
      config: { label: "Title", required: true, min: 3 },
    },
    start: {
      value: event?.start || new Date(),
      validity: true,
      type: "date",
      config: { label: "Start", sm: 6 },
    },
    end: {
      value: event?.end || new Date(),
      validity: true,
      type: "date",
      config: { label: "End", sm: 6 },
    },
    ...customFields,
  };
};

const Editor = () => {
  const {
    fields,
    dialog,
    triggerDialog,
    selectedRange,
    selectedEvent,
    triggerLoading,
    onConfirm,
    customEditor,
    confirmEvent,
  } = useAppState();
  const [state, setState] = useState(
    initialState(fields, selectedEvent || selectedRange)
  );
  const [touched, setTouched] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  const handleEditorState = (name: string, value: any, validity: boolean) => {
    setState((prev) => {
      return {
        ...prev,
        [name]: { ...prev[name], value, validity },
      };
    });
  };

  const handleClose = (clearState?: boolean) => {
    if (clearState) {
      setState(initialState(fields));
    }
    triggerDialog();
  };

  const handleConfirm = async () => {
    let body = {} as ProcessedEvent;
    for (const key in state) {
      body[key] = state[key].value;
      if (!customEditor && !state[key].validity) {
        return setTouched(true);
      }
    }
    try {
      triggerLoading(true);
      // Auto fix date
      body.end = body.start >= body.end ? addHours(body.start, 1) : body.end;
      // Specify action
      const action: EventActions = selectedEvent?.event_id ? "edit" : "create";
      // Trigger custom/remote when provided
      if (onConfirm) {
        body = await onConfirm(body, action);
      } else {
        // Create/Edit local data
        body.event_id =
          selectedEvent?.event_id || randomBytes(6).toString("hex");
      }
      confirmEvent(body, action);
      handleClose(true);
    } catch (error) {
      console.error(error);
    } finally {
      triggerLoading(false);
    }
  };
  const renderInputs = (key: string) => {
    const stateItem = state[key];
    switch (stateItem.type) {
      case "input":
        return (
          <EditorInput
            value={stateItem.value}
            name={key}
            onChange={handleEditorState}
            touched={touched}
            {...stateItem.config}
          />
        );
      case "date":
        return (
          <EditorDatePicker
            value={stateItem.value}
            name={key}
            onChange={(...args) => handleEditorState(...args, true)}
            {...stateItem.config}
          />
        );
      case "select":
        const field = fields.find((f) => f.name === key);
        return (
          <EditorSelect
            value={stateItem.value}
            name={key}
            options={field?.options || []}
            onChange={handleEditorState}
            touched={touched}
            {...stateItem.config}
          />
        );
      default:
        return "";
    }
  };

  const renderEditor = () => {
    if (customEditor) {
      const schedulerHelpers: SchedulerHelpers = {
        state,
        close: () => triggerDialog(false),
        loading: (load) => triggerLoading(load),
        edited: selectedEvent,
        onConfirm: confirmEvent,
      };
      return customEditor(schedulerHelpers);
    }
    return (
      <Fragment>
        <DialogTitle disableTypography>
          <Typography align="center" variant="h6">
            {selectedEvent ? "Edit Event" : "Add Event"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            {Object.keys(state).map((key) => {
              const item = state[key];
              return (
                <Grid item key={key} sm={item.config?.sm} xs={12}>
                  {renderInputs(key)}
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={() => handleClose()}>
            Cancel
          </Button>
          <Button color="primary" fullWidth onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Fragment>
    );
  };

  return (
    <Dialog open={dialog} fullWidth fullScreen={isMobile}>
      {renderEditor()}
    </Dialog>
  );
};

export default Editor;