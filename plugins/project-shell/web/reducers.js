import { Map, List, OrderedMap } from 'immutable';

import {
    COMMANDS_REQUEST,
    COMMANDS_RECEIVE,
    COMMAND_REQUEST,
    COMMAND_RECEIVE,
} from './actions';

const defaultState = Map({
    commands: List(),
    pending: OrderedMap(),
});

export default function(state, { type, cid, ...rest }) {
    if (!state) {
        state = defaultState;
    }

    switch (type) {
        case COMMANDS_REQUEST:
            break;
        case COMMANDS_RECEIVE:
            state = state.set('commands', List(rest.commands));
            break;
        case COMMAND_REQUEST:
            state = state.setIn(['pending', cid], rest);
            break;
        case COMMAND_RECEIVE:
            state = state.deleteIn(['pending', cid]);
            state = state.set('commands', state.get('commands').push(rest.cmd));
            break;
    }

    return state;
}
