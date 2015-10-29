import { Record } from 'immutable';

const base = Record({
    state: 'empty',
    value: void 0,
    error: void 0,
});

export default class extends base {
    constructor({ state, value, error }) {
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
        return this.withMutations(val => {
            val.set('state', 'empty').set('value', void 0).set('error', void 0);
        });
    }

    setLoading() {
        return this.set('state', 'loading');
    }

    setValue(value) {
        return this.withMutations(val => {
            val.set('state', 'success').set('value', value).set('error', void 0);
        });
    }

    setError(error) {
        return this.withMutations(val => {
            val.set('state', 'error').set('value', void 0).set('error', error);
        });
    }
}
