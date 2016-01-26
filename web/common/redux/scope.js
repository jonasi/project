import { get, set } from './utils';
import { createSelector } from 'reselect';

export default class Scope {
    constructor(name) {
        this._name = name + '_' + String(Math.random()).substr(2);
    }

    getState(root) {
        return get(root, this._name);
    }

    setState(root, state) {
        return set(root, this._name, state);
    }

    reducer(reducer) {
        return (state = {}, action) => (
            this.setState(state, reducer(this.getState(state), action))
        );
    }

    selector(...selectors) {
        const fn = selectors.length === 1 ? selectors[0] : createSelector(...selectors);
        const v = (state, ...args) => fn(this.getState(state), ...args);

        v.unscoped = selectors[selectors.length - 1];

        return v;
    }
}
