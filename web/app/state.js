import { Map, List } from 'immutable';
import {
    GET_PLUGINS_REQ, GET_PLUGINS_RESP,
} from './actions';

const defaultState = Map({
    plugins: List(),
});

export default function(state, { type, ...args }) {
    if (!state) {
        state = defaultState;
    }

    switch (type) {
        case GET_PLUGINS_REQ:
            break;
        case GET_PLUGINS_RESP:
            state = state.set('plugins', List(args.plugins));
            break;
    }

    return state;
}
