import { get, set } from './utils';

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

    selector(selector) {
        return (state, ...args) => selector(this.getState(state), ...args);
    }
}
