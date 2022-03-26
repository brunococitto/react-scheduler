import { useState } from "react";
import DateProvider from "../hoc/DateProvider";
import DatePicker from "@mui/lab/DatePicker";
import { Button } from "@mui/material";
import { endOfWeek, format, startOfWeek, addDays } from "date-fns";
import { WeekProps } from "../../views/Week";
import { LocaleArrow } from "../common/LocaleArrow";
import { useAppState } from "../../hooks/useAppState";

interface WeekDateBtnProps {
  selectedDate: Date;
  onChange(value: Date, key: "selectedDate"): void;
  weekProps: WeekProps;
}

const WeekDateBtn = ({
  selectedDate,
  onChange,
  weekProps,
}: WeekDateBtnProps) => {
  const { locale } = useAppState();
  const [open, setOpen] = useState(false);
  const { weekStartOn } = weekProps;
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: weekStartOn });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: weekStartOn });

  const toggleDialog = () => setOpen(!open);

  const getClosestWeekday = (d: Date) => {
    if (d.getDay() === 0)
      return addDays(d, 1);
    if (d.getDay() === 6)
      return addDays(d, -1);
    return d;
  };

  const handleChange = (e: Date | null, k?: string) => {
    onChange(e || getClosestWeekday(new Date()), "selectedDate");
  };

  const handlePrev = () => {
    const ladtDayPrevWeek = addDays(weekStart, -3);
    onChange(ladtDayPrevWeek, "selectedDate");
  };
  const handleNext = () => {
    const firstDayNextWeek = addDays(weekEnd, 1);
    onChange(firstDayNextWeek, "selectedDate");
  };

  const disableDate = (d: Date) => {
    if ([0, 6].includes(d.getDay())) return true;
    if (d < addDays( new Date(), -7)) return true;
    if (d > addDays( new Date(), 14)) return true;
    return false;
  };

  return (
    <div>
      {weekStart < new Date()? <LocaleArrow type="prev" onClick={handlePrev} disabled={true} /> : <LocaleArrow type="prev" onClick={handlePrev}/>}
      <DateProvider>
        <DatePicker
          open={open}
          onClose={toggleDialog}
          openTo="day"
          views={["day"]}
          value={selectedDate}
          onChange={handleChange}
          disableHighlightToday
          shouldDisableDate={(d) => disableDate(d)}
          renderInput={(params) => (
            <Button
              ref={params.inputRef}
              style={{ padding: 4 }}
              onClick={toggleDialog}
            >{`${weekStart.getMonth() === weekEnd.getMonth() ?
              format(weekStart, "dd", { locale: locale }) :
              format(weekStart, "dd MMMM", { locale: locale })
            } - ${format(
              addDays(weekEnd,-2),
              "dd MMMM yyyy",
              {
                locale: locale,
              }
            )}`}</Button>
          )}
        />
      </DateProvider>
      {weekEnd > addDays(new Date(), 14)? <LocaleArrow type="next" onClick={handleNext} disabled={true} /> : <LocaleArrow type="next" onClick={handleNext}/>}
    </div>
  );
};

export { WeekDateBtn };
