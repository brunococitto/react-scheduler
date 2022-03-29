import { useState } from 'react';
import DateProvider from '../hoc/DateProvider';
import DatePicker from '@mui/lab/DatePicker';
import { Button } from '@mui/material';
import { endOfWeek, format, startOfWeek, addDays } from 'date-fns';
import { WeekProps } from '../../views/Week';
import { LocaleArrow } from '../common/LocaleArrow';
import { useAppState } from '../../hooks/useAppState';

interface WeekDateBtnProps {
    selectedDate: Date;
    onChange(value: Date, key: 'selectedDate'): void;
    weekProps: WeekProps;
}

const WeekDateBtn = ({ selectedDate, onChange, weekProps }: WeekDateBtnProps) => {
    const { locale, week } = useAppState();
    const [open, setOpen] = useState(false);
    const { weekStartOn } = weekProps;
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: weekStartOn });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: weekStartOn });

    const toggleDialog = () => setOpen(!open);

    const getClosestWeekday = (d: Date) => {
        if (d.getDay() === 0) return addDays(d, 1);
        if (d.getDay() === 6) return addDays(d, -1);
        return d;
    };

    const handleChange = (e: Date | null, k?: string) => {
        onChange(e || getClosestWeekday(new Date()), 'selectedDate');
    };

    const handlePrev = () => {
        const ladtDayPrevWeek = addDays(weekStart, -2);
        onChange(ladtDayPrevWeek, 'selectedDate');
    };
    const handleNext = () => {
        const firstDayNextWeek = addDays(weekEnd, 1);
        onChange(firstDayNextWeek, 'selectedDate');
    };

    const periodStart = startOfWeek(addDays(new Date(), -7), { weekStartsOn: weekStartOn });
    const periodEnd = endOfWeek(addDays(new Date(), 7), { weekStartsOn: weekStartOn });

    return (
        <div>
            {weekStart < addDays(new Date(), -7) ? (
                <LocaleArrow type="prev" onClick={handlePrev} disabled={true} />
            ) : (
                <LocaleArrow type="prev" onClick={handlePrev} />
            )}
            <DateProvider>
                <DatePicker
                    open={open}
                    onClose={toggleDialog}
                    openTo="day"
                    views={['day']}
                    value={selectedDate}
                    onChange={handleChange}
                    shouldDisableDate={d => !week?.weekDays.some(wd => wd === d.getDay())}
                    minDate={periodStart}
                    maxDate={periodEnd}
                    renderInput={params => (
                        <Button ref={params.inputRef} style={{ padding: 4 }} onClick={toggleDialog}>{`${
                            weekStart.getMonth() === weekEnd.getMonth()
                                ? format(addDays(weekStart, 1), 'dd', { locale: locale })
                                : format(addDays(weekStart, 1), 'dd MMMM', { locale: locale })
                        } - ${format(addDays(weekEnd, -1), 'dd MMMM yyyy', {
                            locale: locale
                        })}`}</Button>
                    )}
                />
            </DateProvider>
            {weekEnd > addDays(new Date(), 7) ? (
                <LocaleArrow type="next" onClick={handleNext} disabled={true} />
            ) : (
                <LocaleArrow type="next" onClick={handleNext} />
            )}
        </div>
    );
};

export { WeekDateBtn };
