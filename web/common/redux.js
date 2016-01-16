import ValueState from './value_state';
import { Map } from 'immutable';

export function thunk(context = {}) {
    return store => next => action => {
        return typeof action === 'function' ?
            action(store.dispatch, store.getState, context) :
            next(action);
    };
}

export function createAPIAction({ type, options, path, method = 'get', ...rest }) {
    return (dispatch, getState, { api }) => {
        dispatch({ type, kind: 'request', ...rest });

        return api[method](path, options)
            .then(body => dispatch({ type, kind: 'response', body, ...rest }));
    };
}

const get = (state, path, def) => (
    state[typeof path === 'string' ? 'get' : 'getIn'](path, def)
);

const set = (state, path, val) => (
    state[typeof path === 'string' ? 'set' : 'setIn'](path, val)
);

export function createAPIReducer({ type, transform }) {
    return function(state, { type: type2, kind, body }) {
        if (!state) {
            state = new ValueState();
        }

        if (type === type2) {
            if (kind === 'request') {
                state = state.setLoading();
            } else {
                const v = transform ? transform(body) : body;
                state = state.setValue(v);
            }
        }

        return state;
    };
}

export function createAPIMapReducer({ type, selector, transform }) {
    return function(state, { type: type2, kind, body, ...args }) {
        if (!state) {
            state = new Map();
        }

        if (type === type2) {
            const k = selector(args);
            let v = get(state, k, new ValueState());

            if (kind === 'request') {
                v = v.setLoading();
            } else {
                const val = transform ? transform(body) : body;
                v = v.setValue(val);
            }

            state = set(state, k, v);
        }

        return state;
    };
}

export function composeReducers(...reducers) {
    return (state, args) => reducers.reduce((state, fn) => fn(state, args), state);
}
