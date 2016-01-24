import ValueState from '../value_state';
import { get, set, identity } from './utils';
import { Map } from 'immutable';

export function createAPIReducer(type, { transform = identity } = {}) {
    return function(state, action) {
        if (!state) {
            state = new ValueState();
        }

        if (type === action.type) {
            if (action.payload.kind === 'request') {
                state = state.setLoading();
            } else {
                state = state.setValue(transform(action.payload.body));
            }
        }

        return state;
    };
}

export function createAPIMapReducer(type, selector, { transform = identity } = {}) {
    return function(state, action) {
        if (!state) {
            state = new Map();
        }

        if (type === action.type) {
            const k = selector(action.payload.context);
            let v = get(state, k, new ValueState());

            if (action.payload.kind === 'request') {
                v = v.setLoading();
            } else {
                v = v.setValue(transform(action.payload.body));
            }

            state = set(state, k, v);
        }

        return state;
    };
}

export function composeReducers(...reducers) {
    return (state, action) => reducers.reduce((state, fn) => fn(state, action), state);
}

export function keyedReducer(key, reducer) {
    return (state, action) => reducer(get(state, key), action);
}

export function combineReducers(reducers) {
    return (state = {}, action) => {
        for (const k in reducers) {
            const subState = reducers[k](get(state, k), action);
            state = set(state, k, subState);
        }

        return state;
    };
}
