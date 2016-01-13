import { Map, List } from 'immutable';
import ValueState from 'web/common/value_state';
import { handleAPIState } from 'web/common/redux';

import {
    GET_VERSION,
    GET_INSTALLED,
    GET_ALL,
    GET_FORMULA,
} from './actions';

const defaultState = Map({
    version: new ValueState(),
    installed: new ValueState(),
    all: new ValueState(),
    formula: Map(),
});

export default function(state, { type, kind, body, ...args }) {
    if (!state) {
        state = defaultState;
    }

    switch (type) {
        case GET_VERSION:
            state = handleAPIState({ state, kind, path: 'version', success: () => body });
            break;

        case GET_INSTALLED:
            state = handleAPIState({ state, kind, path: 'installed', success: () => List(body) });
            break;

        case GET_ALL:
            state = handleAPIState({ state, kind, path: 'all', success: () => List(body) });
            break;

        case GET_FORMULA:
            const path = ['formula', args.formula];

            if (!state.getIn(path)) {
                state = state.setIn(['formula', args.formula], new ValueState());
            }

            state = handleAPIState({ state, kind, path: ['formula', args.formula], success: () => body });
            break;
    }

    return state;
}
