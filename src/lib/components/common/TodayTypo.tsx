import { Typography } from '@mui/material';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface TodayTypoProps {
    date: Date;
    onClick?(day: Date): void;
}

const TodayTypo = ({ date, onClick }: TodayTypoProps) => {
    return (
        <div>
            <Typography
                style={{
                    fontWeight: isToday(date) ? 'bold' : 'inherit'
                }}
                color={isToday(date) ? 'primary' : 'inherit'}
                className={onClick ? 'rs__hover__op' : ''}
                onClick={e => {
                    e.stopPropagation();
                    if (onClick) onClick(date);
                }}>
                {format(date, 'dd', { locale: es })}
            </Typography>
            <Typography
                color={isToday(date) ? 'primary' : 'inherit'}
                style={{
                    fontWeight: isToday(date) ? 'bold' : 'inherit',
                    fontSize: 11
                }}>
                {format(date, 'eee', { locale: es })}
            </Typography>
        </div>
    );
};

export default TodayTypo;
