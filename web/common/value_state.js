import { Record } from 'immutable';

const base = Record({
    state: 'empty',
    value: void 0,
    error: void 0,
});

function mutate(vs, state, value, error) {
    return vs.withMutations(val => {
        val.set('state', state).set('value', value).set('error', error);
    });
}

export default class ValueState extends base {
    constructor({ state, value, error } = {}) {
        if (state === void 0) {
            if (value !== void 0) {
                state = 'success';
            } else if (error !== void 0) {
                state = 'error';
            } else {
                state = 'empty';
            }
        }

        super({ state, value, error });
    }

    reset() {
        return mutate(this, 'empty', void 0, void 0);
    }

    setLoading() {
        return this.set('state', 'loading');
    }

    transformValue(fn) {
        return this.set('value', fn(this.value));
    }

    setValue(value) {
        return mutate(this, 'success', value, void 0);
    }

    setError(error) {
        return mutate(this, 'error', void 0, error);
    }

    isEmpty() {
        return this.state === 'empty';
    }

    isLoading() {
        return this.state === 'loading';
    }

    isSuccess() {
        return this.state === 'success';
    }

    isError() {
        return this.state === 'error';
    }

    isLoaded() {
        return this.isSuccess() || this.isError();
    }
}
