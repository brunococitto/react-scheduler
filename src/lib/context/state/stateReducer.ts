import { SchedulerState } from './stateContext';

interface Action {
    type: string;
    payload: any;
}

const stateReducer = (state: SchedulerState, action: Action): SchedulerState => {
    switch (action.type) {
        case 'updateProps':
            return {
                ...state,
                ...action.payload
            };
        case 'set':
            const { name, value } = action.payload;
            return {
                ...state,
                [name]: value
            };
        case 'triggerDialog':
            const selected = action.payload.selected;
            return {
                ...state,
                dialog: action.payload.status,
                selectedRange: selected?._id ? null : selected,
                selectedEvent: selected?._id ? selected : null
            };

        case 'triggerLoading':
            return {
                ...state,
                loading: action.payload
            };
        default:
            return state;
    }
};
export { stateReducer };
