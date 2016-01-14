import { handleAPIAction } from 'web/common/redux';
import { Map, OrderedMap } from 'immutable';
import ValueState from 'web/common/value_state';
import moment from 'moment';

import {
    GET_COMMANDS,
    POST_COMMAND,
    GET_COMMAND,
    GET_STDOUT,
    GET_STDERR,
} from './actions';

const defaultState = Map({
    commands: new ValueState({ value: OrderedMap() }),
    stdout: Map(),
    stderr: Map(),
});

export default function(state, { type, kind, body, ...args }) {
    if (!state) {
        state = defaultState;
    }

    switch (type) {
        case GET_COMMANDS:
            state = handleAPIAction({ state, kind, path: 'commands', success: () => OrderedMap(body.map(cmd => [cmd.id, new ValueState({ value: cmd })])) });
            break;

        case GET_COMMAND:
            state = handleAPIAction({ state, kind, path: ['commands', 'value', args.id], success: () => body });
            break;

        case POST_COMMAND:
            state = handleAPIAction({ state, kind, path: ['commands', 'value', args.id], success: () => body });
            state = state.set('commands', state.get('commands').setValue(
                state.getIn(['commands', 'value']).filter(cmd => !!cmd.value).sortBy(cmd => -moment(cmd.value.started_at).unix())
            ));
            break;

        case GET_STDOUT:
            state = handleAPIAction({ state, kind, path: ['stdout', args.id], success: () => body });
            break;

        case GET_STDERR:
            state = handleAPIAction({ state, kind, path: ['stderr', args.id], success: () => body });
            break;
    }

    return state;
}
