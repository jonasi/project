import { Map, List } from 'immutable';
import ValueState from 'web/common/value_state';
import { handleAPIState } from 'web/common/redux';

import {
    GET_PLUGINS,
} from './actions';

const defaultState = Map({
    plugins: new ValueState(),
});

export default function(state, { type, kind, body }) {
    if (!state) {
        state = defaultState;
    }

    switch (type) {
        case GET_PLUGINS:
            state = handleAPIState({ state, kind, path: 'plugins', success: () => List(body) });
            break;
    }

    return state;
}
