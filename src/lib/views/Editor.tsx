import { Fragment, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Button,
    Grid,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { addMinutes, differenceInMinutes } from 'date-fns';
import { EditorDatePicker } from '../components/inputs/DatePicker';
import { EditorInput } from '../components/inputs/Input';
import { SelectedRange } from '../context/state/stateContext';
import { useAppState } from '../hooks/useAppState';
import {
    EventActions,
    FieldInputProps,
    FieldProps,
    InputTypes,
    ProcessedEvent,
    SchedulerHelpers
} from '../types';
import { EditorSelect } from '../components/inputs/SelectInput';
import { arraytizeFieldVal } from '../helpers/generals';
import { EditorNotify } from '../components/inputs/Notify';
import { EditorAutocomplete } from '../components/inputs/Autocomplete';

export type StateItem = {
    value: any;
    validity: boolean;
    type: InputTypes;
    config?: FieldInputProps;
};

export type StateEvent = (ProcessedEvent & SelectedRange) | Record<string, any>;

const initialState = (fields: FieldProps[], event?: StateEvent): Record<string, StateItem> => {
    const customFields = {} as Record<string, StateItem>;
    for (const field of fields) {
        const defVal = arraytizeFieldVal(field, field.default, event);
        const eveVal = arraytizeFieldVal(field, event?.[field.name], event);

        customFields[field.name] = {
            value: eveVal.value || defVal.value || '',
            validity: field.config?.required ? !!eveVal.validity || !!defVal.validity : true,
            type: field.type,
            config: field.config
        };
    }

    return {
        id: {
            value: event?._id || null,
            validity: true,
            type: 'hidden'
        },
        patient: {
            value: event?.patient || '',
            validity: !!event?.patient,
            type: 'autocomplete',
            config: { label: 'Paciente', required: false, min: 3 }
        },
        start: {
            value: event?.start || new Date(),
            validity: true,
            type: 'date',
            config: { label: 'Inicio', required: true, sm: 5 }
        },
        end: {
            value: event?.end || new Date(),
            validity: false,
            type: 'date',
            config: { label: 'Fin', required: true, sm: 5 }
        },
        ...customFields
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
        dialogMaxWidth
    } = useAppState();
    const [state, setState] = useState(initialState(fields, selectedEvent || selectedRange));
    const [touched, setTouched] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleEditorState = (name: string, value: any, validity: boolean) => {
        setState(prev => {
            return {
                ...prev,
                [name]: { ...prev[name], value, validity }
            };
        });
    };

    const handleClose = (clearState?: boolean) => {
        if (clearState) {
            setState(initialState(fields));
        }
        triggerDialog(false);
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
            body.end =
                body.start >= body.end
                    ? addMinutes(body.start, differenceInMinutes(selectedRange?.end!, selectedRange?.start!))
                    : body.end;
            // Specify action
            const action: EventActions = selectedEvent?._id ? 'edit' : 'create';
            // Trigger custom/remote when provided
            if (onConfirm) {
                body = await onConfirm(body, action);
            } else {
                // Create/Edit local data
                body._id =
                    selectedEvent?._id || Date.now().toString(36) + Math.random().toString(36).slice(2);
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
        const keysToDisableWhenPastDate = ['patient', 'start', 'end', 'notifyPatient', 'type'];
        switch (stateItem.type) {
            case 'input':
                return (
                    <EditorInput
                        value={stateItem.value}
                        name={key}
                        onChange={handleEditorState}
                        touched={touched}
                        {...stateItem.config}
                        disabled={
                            keysToDisableWhenPastDate.includes(key) && state['end'].value < new Date()
                                ? true
                                : undefined
                        }
                    />
                );
            case 'autocomplete':
                return (
                    <EditorAutocomplete
                        value={stateItem.value}
                        name={key}
                        onChange={handleEditorState}
                        touched={touched}
                        {...stateItem.config}
                        disabled={
                            keysToDisableWhenPastDate.includes(key) && state['end'].value < new Date()
                                ? true
                                : undefined
                        }
                    />
                );
            case 'date':
                return (
                    <EditorDatePicker
                        value={stateItem.value}
                        name={key}
                        onChange={(...args) => handleEditorState(...args, true)}
                        {...stateItem.config}
                        disabled={
                            keysToDisableWhenPastDate.includes(key) && state['end'].value < new Date()
                                ? true
                                : undefined
                        }
                    />
                );
            case 'select':
                const field = fields.find(f => f.name === key);
                return (
                    <EditorSelect
                        value={stateItem.value}
                        name={key}
                        options={field?.options || []}
                        onChange={handleEditorState}
                        touched={touched}
                        {...stateItem.config}
                        disabled={
                            keysToDisableWhenPastDate.includes(key) && state['end'].value < new Date()
                                ? true
                                : undefined
                        }
                    />
                );
            case 'notify':
                return (
                    <EditorNotify
                        value={stateItem.value}
                        name={key}
                        onChange={handleEditorState}
                        notifyCount={state['notificationsCount']?.value}
                        isNew={!selectedEvent}
                        {...stateItem.config}
                        disabled={
                            keysToDisableWhenPastDate.includes(key) && state['end'].value < new Date()
                                ? true
                                : undefined
                        }
                    />
                );
            default:
                return '';
        }
    };

    const renderEditor = () => {
        if (customEditor) {
            const schedulerHelpers: SchedulerHelpers = {
                state,
                close: () => triggerDialog(false),
                loading: load => triggerLoading(load),
                edited: selectedEvent,
                onConfirm: confirmEvent
            };
            return customEditor(schedulerHelpers);
        }
        return (
            <Fragment>
                <DialogTitle>{selectedEvent ? 'Editar' : 'Agregar'}</DialogTitle>
                <DialogContent style={{ overflowX: 'hidden' }}>
                    <Grid container spacing={1}>
                        {Object.keys(state).map(key => {
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
                    <Button color="inherit" fullWidth onClick={() => handleClose()}>
                        Cancelar
                    </Button>
                    <Button color="primary" fullWidth onClick={handleConfirm}>
                        Confirmar
                    </Button>
                </DialogActions>
            </Fragment>
        );
    };

    return (
        <Dialog open={dialog} fullScreen={isMobile} maxWidth={dialogMaxWidth}>
            {renderEditor()}
        </Dialog>
    );
};

export default Editor;
