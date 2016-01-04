import { Map, OrderedMap } from 'immutable';
import moment from 'moment';

import {
    GET_COMMANDS_REQ, GET_COMMANDS_RESP,
    POST_COMMAND_REQ, POST_COMMAND_RESP,
    GET_COMMAND_REQ, GET_COMMAND_RESP,
    GET_STDOUT_REQ, GET_STDOUT_RESP,
    GET_STDERR_REQ, GET_STDERR_RESP,
} from './actions';

const defaultState = Map({
    commands: OrderedMap(),
    pending: OrderedMap(),
    stdout: Map(),
    stderr: Map(),
});

export default function(state, { type, ...args }) {
    if (!state) {
        state = defaultState;
    }

    switch (type) {
        case GET_COMMANDS_REQ:
            break;
        case GET_COMMANDS_RESP:
            state = state.set('commands', OrderedMap(args.commands.map(cmd => [cmd.id, cmd])));
            break;

        case GET_COMMAND_REQ:
            break;
        case GET_COMMAND_RESP:
            state = state.setIn(['commands', args.command.id], args.command);
            break;

        case POST_COMMAND_REQ:
            const { cid, ...rest } = args;
            state = state.setIn(['pending', cid], rest);
            break;
        case POST_COMMAND_RESP:
            state = state.deleteIn(['pending', args.cid]);
            state = state.setIn(['commands', args.cmd.id], args.cmd);
            state = state.set('commands', state.get('commands').sortBy(cmd => -moment(cmd.started_at).unix()));
            break;

        case GET_STDOUT_REQ:
            break;

        case GET_STDOUT_RESP:
            state = state.setIn(['stdout', args.id], args.stdout);
            break;

        case GET_STDERR_REQ:
            break;

        case GET_STDERR_RESP:
            state = state.setIn(['stderr', args.id], args.stderr);
            break;
    }

    return state;
}
