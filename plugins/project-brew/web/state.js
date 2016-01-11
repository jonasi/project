import { Map, List } from 'immutable';

import {
    GET_VERSION_REQ, GET_VERSION_RESP,
    GET_INSTALLED_REQ, GET_INSTALLED_RESP,
    GET_ALL_REQ, GET_ALL_RESP,
    GET_FORMULA_REQ, GET_FORMULA_RESP,
} from './actions';

const defaultState = Map({
    version: {},
    installed: List(),
    all: List(),
    formula: Map(),
});

export default function(state, { type, ...args }) {
    if (!state) {
        state = defaultState;
    }

    switch (type) {
        case GET_VERSION_REQ:
            break;
        case GET_VERSION_RESP:
            state = state.set('version', args.version);
            break;

        case GET_INSTALLED_REQ:
            break;
        case GET_INSTALLED_RESP:
            state = state.set('installed', List(args.installed));
            break;

        case GET_ALL_REQ:
            break;
        case GET_ALL_RESP:
            state = state.set('all', List(args.all));
            break;

        case GET_FORMULA_REQ:
            break;
        case GET_FORMULA_RESP:
            state = state.setIn(['formula', args.formula.name], args.formula);
            break;
    }

    return state;
}
