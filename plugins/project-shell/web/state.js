import { List } from 'immutable';

import { Scope, createAPIReducer, createAPIMapReducer, composeReducers, combineReducers } from 'web/common/redux';

import {
    GET_COMMANDS,
    POST_COMMAND,
    GET_COMMAND,
    GET_STDOUT,
    GET_STDERR,
} from './actions';

const ns = new Scope('shell');

const history = createAPIReducer(GET_COMMANDS, { transform: body => List(body) });
const commands = createAPIMapReducer(GET_COMMAND, ctxt => ctxt.id);
const stdout = createAPIMapReducer(GET_STDOUT, ctxt => ctxt.id);
const stderr = createAPIMapReducer(GET_STDERR, ctxt => ctxt.id);

export const reducer = ns.reducer(composeReducers(
    combineReducers({ history, commands, stdout, stderr }),
    (state, action) => {
        if (action.type === POST_COMMAND && action.kind === 'response') {
            const history = state.history.transformValue(v => v.unshift(action.body));
            state = Object.assign({}, state, { history });
        }

        return state;
    }
));

export const getCommand = ns.selector((state, id) => state.commands.get(id));
export const getHistory = ns.selector(state => state.history);
export const getStdout = ns.selector((state, id) => state.stdout.get(id));
export const getStderr = ns.selector((state, id) => state.stderr.get(id));
