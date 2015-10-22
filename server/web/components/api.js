import React, { Component, PropTypes } from 'react';
import { Record, Map } from 'immutable';

const { object } = PropTypes;

export default function(vals) {
    return c => comp(c, vals);
}

const ValueState = Record({
    state: void 0,
    value: void 0,
    error: void 0,
});

function comp(Comp, vals) {
    let results = Map();

    for (const k in vals) {
        if (typeof vals[k] === 'string') {
            vals[k] = { path: vals[k], initialValue: void 0 };
        }

        if (typeof vals[k].path === 'string') {
            const old = vals[k].path;
            vals[k].path = () => old;
        }

        results = results.set(k, ValueState({
            state: 'empty',
            value: vals[k].initialValue,
        }));
    }

    return class APIComponent extends Component {
        static contextTypes = {
            api: object.isRequired,
        }

        constructor(props, context) {
            super(props, context);

            this.state = { results };
        }

        componentWillMount() {
            const { api } = this.context;

            for (const k in vals) {
                const path = vals[k].path(this.props);

                api.get(path)
                    .then(val => this._mergeResults(k, val))
                    .catch(error => this._mergeResults(k, void 0, error));
            }
        }

        _mergeResults(k, value, error) {
            const { results } = this.state;
            const state = arguments.length === 2 ? 'success' : 'error';

            const v = ValueState({ state, value, error });

            this.setState({ 
                results: results.set(k, v),
            });
        }

        render() {
            const props = merge({}, this.props, this.state.results);

            return <Comp { ...props } />;
        }
    };
}

function merge(first, ...rest) {
    if (first instanceof Map) {
        first = first.toObject();
    }

    for (const k in rest) {
        if (rest[k] instanceof Map) {
            rest[k].forEach((v, k) => first[k] = v);
        } else {
            Object.assign(first, rest[k]);
        }
    }

    return first;
}
