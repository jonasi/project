import { List } from 'immutable';

import { createAPIReducer, createAPIMapReducer, composeReducers } from 'web/common/redux';
import { combineReducers } from 'redux';

import {
    GET_COMMANDS,
    POST_COMMAND,
    GET_COMMAND,
    GET_STDOUT,
    GET_STDERR,
} from './actions';

const history = createAPIReducer({ type: GET_COMMANDS, transform: body => List(body) });
const commands = createAPIMapReducer({ type: GET_COMMAND, selector: args => args.id });
const stdout = createAPIMapReducer({ type: GET_STDOUT, selector: args => args.id });
const stderr = createAPIMapReducer({ type: GET_STDERR, selector: args => args.id });

export default composeReducers(
    combineReducers({ history, commands, stdout, stderr }),
    (state, action) => {
        if (action.type === POST_COMMAND && action.kind === 'response') {
            const history = state.history.transformValue(v => v.unshift(action.body));
            state = Object.assign({}, state, { history });
        }

        return state;
    }
);
