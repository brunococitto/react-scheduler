import DateProvider from '../hoc/DateProvider';
import DatePicker from '@mui/lab/DatePicker';
import DateTimePicker from '@mui/lab/DateTimePicker';
import { TextField } from '@mui/material';

interface EditorDatePickerProps {
    type: 'date' | 'datetime';
    label?: string;
    variant?: 'standard' | 'filled' | 'outlined';
    modalVariant?: 'dialog' | 'inline' | 'static';
    value: Date | string;
    name: string;
    onChange(name: string, date: Date): void;
    error?: boolean;
    errMsg?: string;
    disabled?: boolean;
}

const EditorDatePicker = ({
    type,
    value,
    label,
    name,
    onChange,
    variant,
    modalVariant,
    error,
    errMsg,
    disabled
}: EditorDatePickerProps) => {
    const Picker = type === 'date' ? DatePicker : DateTimePicker;
    return (
        <DateProvider>
            <Picker
                value={value}
                label={label}
                disablePast
                ampm={true}
                PopperProps={{ placement: 'right' }}
                onChange={e => onChange(name, new Date(e || ''))}
                minutesStep={5}
                disabled={disabled}
                renderInput={params => (
                    <TextField
                        variant={variant}
                        helperText={error ? 'errMsg' : ''}
                        error={error}
                        style={{ width: '100%' }}
                        {...params}
                    />
                )}
            />
        </DateProvider>
    );
};

EditorDatePicker.defaultProps = {
    type: 'datetime',
    variant: 'outlined',
    modalVariant: 'inline'
};
export { EditorDatePicker };
