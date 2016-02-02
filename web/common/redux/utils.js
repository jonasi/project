import { isPlainObject, get as objectGet, set as objectSet } from 'lodash';

export const get = (state, path, def) => {
    if (!state) {
        return state;
    }

    if (isPlainObject(state)) {
        return objectGet(state, path, def);
    }

    return state[typeof path === 'string' ? 'get' : 'getIn'](path, def);
};

export const set = (state, path, val) => {
    if (isPlainObject(state)) {
        return objectSet(Object.assign({}, state), path, val);
    }

    return state[typeof path === 'string' ? 'set' : 'setIn'](path, val);
};

export const identity = x => x;
