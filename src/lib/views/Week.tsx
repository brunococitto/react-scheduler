import { useEffect, useCallback, Fragment } from 'react';
import { Typography } from '@mui/material';
import {
    startOfWeek,
    addDays,
    format,
    eachMinuteOfInterval,
    isSameDay,
    differenceInDays,
    isBefore,
    isToday,
    setMinutes,
    setHours,
    isWithinInterval,
    isAfter,
    endOfDay,
    startOfDay,
    addMinutes
} from 'date-fns';
import TodayTypo from '../components/common/TodayTypo';
import EventItem from '../components/events/EventItem';
import { useAppState } from '../hooks/useAppState';
import { CellRenderedProps, DayHours, DefaultRecourse, ProcessedEvent } from '../types';
import { WeekDays } from './Month';
import { calcCellHeight, calcMinuteHeight, getResourcedEvents } from '../helpers/generals';
import { WithResources } from '../components/common/WithResources';
import { Cell } from '../components/common/Cell';
import TodayEvents from '../components/events/TodayEvents';
import { TableGrid } from '../styles/styles';
import { MULTI_DAY_EVENT_HEIGHT } from '../helpers/constants';

export interface WeekProps {
    weekDays: WeekDays[];
    weekStartOn: WeekDays;
    startHour: DayHours;
    endHour: DayHours;
    step: number;
    cellRenderer?(props: CellRenderedProps): JSX.Element;
}

const Week = () => {
    const holidaysPlain = [
        {
            '1': {
                motivo: 'Año Nuevo',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/A%C3%B1o_Nuevo',
                id: 'año-nuevo'
            }
        },
        {
            '28': {
                motivo: 'Carnaval',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/Carnaval',
                id: 'carnaval'
            }
        },
        {
            '1': {
                motivo: 'Carnaval',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/Carnaval',
                id: 'carnaval'
            },
            '24': {
                motivo: 'Día Nacional de la Memoria por la Verdad y la Justicia',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/D%C3%ADa_Nacional_de_la_Memoria_por_la_Verdad_y_la_Justicia',
                id: 'memoria-verdad-justicia'
            }
        },
        {
            '2': {
                motivo: 'Día del Veterano y de los Caídos en la Guerra de Malvinas',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/D%C3%ADa_del_Veterano_y_de_los_Ca%C3%ADdos_en_la_Guerra_de_Malvinas',
                id: 'veteranos-malvinas'
            },
            '15': {
                motivo: 'Viernes Santo Festividad Cristiana',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/Viernes_Santo',
                id: 'viernes-santo'
            }
        },
        {
            '1': {
                motivo: 'Día del Trabajador',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/D%C3%ADa_Internacional_de_los_Trabajadores',
                id: 'trabajador'
            },
            '25': {
                motivo: 'Día de la Revolución de Mayo',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/Revoluci%C3%B3n_de_Mayo',
                id: 'revolucion-mayo'
            }
        },
        {
            '17': {
                motivo: 'Paso a la Inmortalidad del Gral. Don Martín Güemes',
                tipo: 'trasladable',
                original: '17-06',
                info: 'https://es.wikipedia.org/wiki/Mart%C3%ADn_Miguel_de_G%C3%BCemes',
                id: 'martin-guemes'
            },
            '20': {
                motivo: 'Paso a la Inmortalidad del General Manuel Belgrano',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/D%C3%ADa_de_la_Bandera_(Argentina)',
                id: 'belgrano'
            }
        },
        {
            '9': {
                motivo: 'Día de la Independencia',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/Declaraci%C3%B3n_de_independencia_de_la_Argentina',
                id: 'independencia'
            }
        },
        {
            '15': {
                motivo: 'Paso a la Inmortalidad del General José de San Martín',
                tipo: 'trasladable',
                original: '17-08',
                info: 'https://es.wikipedia.org/wiki/Jos%C3%A9_de_San_Mart%C3%ADn',
                id: 'san-martin'
            }
        },
        {},
        {
            '7': {
                motivo: 'Feriado Puente Turístico',
                tipo: 'puente',
                info: 'https://es.wikipedia.org/wiki/Puente_festivo',
                id: 'puente-turistico'
            },
            '10': {
                motivo: 'Día del Respeto a la Diversidad Cultural',
                tipo: 'trasladable',
                original: '12-10',
                info: 'https://es.wikipedia.org/wiki/D%C3%ADa_del_Respeto_a_la_Diversidad_Cultural_(Argentina)',
                id: 'diversidad'
            }
        },
        {
            '20': {
                motivo: 'Día de la Soberanía Nacional',
                tipo: 'trasladable',
                original: '20-11',
                info: 'https://es.wikipedia.org/wiki/D%C3%ADa_de_la_Soberan%C3%ADa_Nacional',
                id: 'soberania-nacional'
            },
            '21': {
                motivo: 'Feriado Puente Turístico',
                tipo: 'puente',
                info: 'https://es.wikipedia.org/wiki/Puente_festivo',
                id: 'puente-turistico'
            }
        },
        {
            '8': {
                motivo: 'Inmaculada Concepción de María',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/Inmaculada_Concepci%C3%B3n',
                id: 'inmaculada-maria'
            },
            '9': {
                motivo: 'Feriado Puente Turístico',
                tipo: 'puente',
                info: 'https://es.wikipedia.org/wiki/Puente_festivo',
                id: 'puente-turistico'
            },
            '25': {
                motivo: 'Navidad',
                tipo: 'inamovible',
                info: 'https://es.wikipedia.org/wiki/Navidad',
                id: 'navidad'
            }
        }
    ];

    const holidaysParsed = holidaysPlain
        .map(m => Object.keys(m).map(d => new Date(`2022 ${holidaysPlain.indexOf(m) + 1} ${d}`).getTime()))
        .flat();

    const isHoliday = (d: Date) => {
        return holidaysParsed.includes(d.getTime());
    };

    const {
        week,
        selectedDate,
        height,
        events,
        triggerDialog,
        handleGotoDay,
        remoteEvents,
        triggerLoading,
        handleState,
        resources,
        resourceFields,
        fields,
        direction,
        locale
    } = useAppState();

    const { weekStartOn, weekDays, startHour, endHour, step, cellRenderer } = week!;
    const _weekStart = startOfWeek(selectedDate, { weekStartsOn: weekStartOn });
    const daysList = weekDays.map(d => addDays(_weekStart, d));
    const weekStart = startOfDay(daysList[0]);
    const weekEnd = endOfDay(daysList[daysList.length - 1]);
    const START_TIME = setMinutes(setHours(selectedDate, startHour), 0);
    const END_TIME = setMinutes(setHours(selectedDate, endHour), 0);
    const hours = eachMinuteOfInterval(
        {
            start: START_TIME,
            end: END_TIME
        },
        { step: step }
    );
    const CELL_HEIGHT = calcCellHeight(height, hours.length);
    const MINUTE_HEIGHT = calcMinuteHeight(CELL_HEIGHT, step);
    const MULTI_SPACE = MULTI_DAY_EVENT_HEIGHT;

    const fetchEvents = useCallback(async () => {
        try {
            triggerLoading(true);
            const query = `?start=${weekStart}&end=${weekEnd}`;
            const events = await remoteEvents!(query);
            if (Array.isArray(events)) {
                handleState(events, 'events');
            }
        } catch (error) {
            throw error;
        } finally {
            triggerLoading(false);
        }
        // eslint-disable-next-line
    }, [selectedDate]);

    useEffect(() => {
        if (remoteEvents instanceof Function) {
            fetchEvents();
        }
        // eslint-disable-next-line
    }, [fetchEvents]);

    const renderMultiDayEvents = (events: ProcessedEvent[], today: Date) => {
        const isFirstDayInWeek = isSameDay(weekStart, today);
        const allWeekMulti = events.filter(
            e =>
                differenceInDays(e.end, e.start) > 0 &&
                daysList.some(weekday =>
                    isWithinInterval(weekday, {
                        start: startOfDay(e.start),
                        end: endOfDay(e.end)
                    })
                )
        );

        const multiDays = allWeekMulti
            .filter(e => (isBefore(e.start, weekStart) ? isFirstDayInWeek : isSameDay(e.start, today)))
            .sort((a, b) => b.end.getTime() - a.end.getTime());

        return multiDays.map((event, i) => {
            const hasPrev = isBefore(startOfDay(event.start), weekStart);
            const hasNext = isAfter(endOfDay(event.end), weekEnd);
            const eventLength =
                differenceInDays(hasNext ? weekEnd : event.end, hasPrev ? weekStart : event.start) + 1;
            const prevNextEvents = events.filter(e =>
                isFirstDayInWeek
                    ? false
                    : e._id !== event._id && //Exclude it's self
                      isWithinInterval(today, { start: e.start, end: e.end })
            );

            let index = i;
            if (prevNextEvents.length) {
                index += prevNextEvents.length;
            }
            return (
                <div
                    key={event._id}
                    className="rs__multi_day"
                    style={{
                        top: index * MULTI_SPACE + 45,
                        width: `${100 * eventLength}%`
                    }}>
                    <EventItem event={event} hasPrev={hasPrev} hasNext={hasNext} multiday />
                </div>
            );
        });
    };

    const renderTable = (resource?: DefaultRecourse) => {
        let recousedEvents = events;
        if (resource) {
            recousedEvents = getResourcedEvents(events, resource, resourceFields, fields);
        }

        const allWeekMulti = events.filter(
            e =>
                differenceInDays(e.end, e.start) > 0 &&
                daysList.some(weekday =>
                    isWithinInterval(weekday, {
                        start: startOfDay(e.start),
                        end: endOfDay(e.end)
                    })
                )
        );
        // Equalizing multi-day section height
        const headerHeight = MULTI_SPACE * allWeekMulti.length + 45;
        return (
            <TableGrid days={daysList.length}>
                {/* Header days */}
                <span className="rs__cell"></span>
                {daysList.map((date, i) => (
                    <span
                        key={i}
                        className={`rs__cell rs__header ${isHoliday(date) ? 'rs__holiday_cell' : ''}`}
                        style={{ height: headerHeight }}>
                        <TodayTypo date={date} />
                        {renderMultiDayEvents(recousedEvents, date)}
                    </span>
                ))}

                {/* Time Cells */}
                {hours.map((h, i) => (
                    <Fragment key={i}>
                        <span style={{ height: CELL_HEIGHT }} className="rs__cell rs__header rs__time">
                            <Typography variant="caption">
                                {format(h, 'hh:mm a', { locale: locale })}
                            </Typography>
                        </span>
                        {daysList.map((date, ii) => {
                            const start = new Date(`${format(date, 'yyyy MM dd')} ${format(h, 'hh:mm a')}`);
                            const end = new Date(
                                `${format(date, 'yyyy MM dd')} ${format(addMinutes(h, step), 'hh:mm a')}`
                            );
                            const field = resourceFields.idField;
                            return (
                                <span
                                    key={ii}
                                    className={`rs__cell ${isHoliday(date) ? 'rs__holiday_cell' : ''}`}>
                                    {/* Events of each day - run once on the top hour column */}
                                    {i === 0 && (
                                        <TodayEvents
                                            todayEvents={recousedEvents
                                                .filter(
                                                    e =>
                                                        isSameDay(date, e.start) &&
                                                        !differenceInDays(e.end, e.start)
                                                )
                                                .sort((a, b) => a.end.getTime() - b.end.getTime())}
                                            today={date}
                                            minuteHeight={MINUTE_HEIGHT}
                                            startHour={startHour}
                                            step={step}
                                            direction={direction}
                                        />
                                    )}
                                    {cellRenderer ? (
                                        cellRenderer({
                                            day: date,
                                            start,
                                            end,
                                            height: CELL_HEIGHT,
                                            onClick: () =>
                                                triggerDialog(true, {
                                                    start,
                                                    end,
                                                    [field]: resource ? resource[field] : null
                                                }),
                                            [field]: resource ? resource[field] : null
                                        })
                                    ) : (
                                        <Cell
                                            start={start}
                                            end={end}
                                            resourceKey={field}
                                            resourceVal={resource ? resource[field] : null}
                                        />
                                    )}
                                </span>
                            );
                        })}
                    </Fragment>
                ))}
            </TableGrid>
        );
    };
    return resources.length ? <WithResources renderChildren={renderTable} /> : renderTable();
};

export { Week };
