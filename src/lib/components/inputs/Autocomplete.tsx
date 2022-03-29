import { useEffect } from 'react';

import { Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

interface PatientOptionType {
    name: string;
    _id: string;
}

interface EditorAutocompleteProps {
    variant?: 'standard' | 'filled' | 'outlined';
    label?: string;
    placeholder?: string;
    required?: boolean;
    min?: number;
    max?: number;
    email?: boolean;
    decimal?: boolean;
    disabled?: boolean;
    multiline?: boolean;
    rows?: number;
    value: PatientOptionType;
    name: string;
    onChange(name: string, value: string, isValid: boolean): void;
    touched?: boolean;
}

const top100Films: readonly PatientOptionType[] = [
    { name: 'Bruno Cocitto López', _id: '61a8141f57fa699aba829df8' }
];

const EditorAutocomplete = ({
    variant,
    label,
    placeholder,
    value,
    name,
    required,
    onChange,
    disabled,
    touched
}: EditorAutocompleteProps) => {
    useEffect(() => {
        if (touched) {
            handleChange(value);
        }
        // eslint-disable-next-line
    }, [touched]);

    const handleChange = (value: PatientOptionType | any) => {
        onChange(name, value, true);
    };

    const options = top100Films.map(option => {
        const firstLetter = option.name[0].toUpperCase();
        return {
            firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
            ...option
        };
    });

    return (
        <Autocomplete
            getOptionLabel={op => {
                return op.name ? op.name : '';
            }}
            isOptionEqualToValue={op => {
                return op.name === value.name;
            }}
            groupBy={op => op.name[0].toUpperCase()}
            disablePortal
            options={options.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))}
            style={{ width: '100%' }}
            value={value || null}
            disabled={disabled}
            onChange={(event, newValue) => handleChange(newValue)}
            renderInput={params => (
                <TextField
                    {...params}
                    variant={variant}
                    label={
                        label && <Typography variant="body2">{`${label} ${required ? '*' : ''}`}</Typography>
                    }
                    placeholder={placeholder || ''}
                />
            )}
        />
    );
};

EditorAutocomplete.defaultProps = {
    variant: 'outlined'
};
export { EditorAutocomplete };
