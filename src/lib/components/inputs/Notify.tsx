import { useState, useEffect } from 'react';
import {
    IconButton,
    Checkbox,
    Tooltip,
    Badge,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SendToMobileOutlinedIcon from '@mui/icons-material/SendToMobileOutlined';

interface EditorNotifyProps {
    disabled?: boolean;
    name: string;
    onChange(name: string, value: boolean, isValid: boolean): void;
    value: boolean;
    notifyCount?: number;
    isNew?: boolean;
}

const EditorNotify = ({ value, name, onChange, disabled, notifyCount, isNew }: EditorNotifyProps) => {
    const [tooltipText, setTooltipText] = useState(value ? 'Notificar' : 'No notificar');
    const [notifyConfirmationDialog, setNotifyConfirmationDialog] = useState(false);
    const [notifyConfirmation, setNotifyConfirmation] = useState(false);

    const handleChange = (value: boolean) => {
        let val = value;
        setTooltipText(value ? 'Notificar' : 'No notificar');
        onChange(name, val, true);
    };

    const handleNotifyNow = () => {
        setNotifyConfirmationDialog(true);
    };

    const handleNotifyConfirmationDialogConfirm = () => {
        setNotifyConfirmationDialog(false);
        setNotifyConfirmation(true);
    };

    const handleNotifyConfirmationDialogDeny = () => {
        setNotifyConfirmationDialog(false);
        setNotifyConfirmation(false);
    };

    useEffect(() => {
        if (notifyConfirmation) console.log('Acá le pega al appointment provider y dsp muestra notificación');
    }, [notifyConfirmation]);

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%'
                }}>
                <Tooltip title={tooltipText}>
                    <Checkbox
                        icon={<NotificationsOutlinedIcon />}
                        checkedIcon={<NotificationsIcon />}
                        checked={value ? true : false}
                        name={name}
                        onChange={e => handleChange(e.target.checked)}
                        disabled={disabled}
                    />
                </Tooltip>
                {value && !isNew && (
                    <Tooltip title={disabled ? '' : 'Enviar notificación'}>
                        <span>
                            <IconButton onClick={handleNotifyNow} disabled={disabled}>
                                <Badge badgeContent={notifyCount ? notifyCount : 0} color="primary">
                                    <SendToMobileOutlinedIcon />
                                </Badge>
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
            </div>
            <Dialog open={notifyConfirmationDialog}>
                <DialogTitle>{'Confirmar la notificación'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Desea confirmar la notificación?
                        {notifyCount
                            ? ` Ya se ha notificado ${notifyCount} ${
                                  notifyCount > 1 ? 'veces' : 'vez'
                              } al paciente.`
                            : ' Todavía no se notificó al paciente.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleNotifyConfirmationDialogDeny}
                        color="error"
                        style={{ fontWeight: 'bold' }}>
                        No
                    </Button>
                    <Button onClick={handleNotifyConfirmationDialogConfirm} color="primary" autoFocus>
                        Sí
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

EditorNotify.defaultProps = {};

export { EditorNotify };
