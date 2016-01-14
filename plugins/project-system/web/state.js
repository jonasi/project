import { Map } from 'immutable';

const defaultState = Map({
});

export default function(state) {
    if (!state) {
        state = defaultState;
    }

    return state;
}
