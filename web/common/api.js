import 'whatwg-fetch';

import React, { Component, PropTypes } from 'react';
import { Record, Map } from 'immutable';

const { object } = PropTypes;

const { fetch } = window;

export default class API {
    get(...args) {
        return fetch(...args).then(d => d.json()).then(d => {
            if (d.error) {
                throw new Error(d.error);
            }

            return d.data;
        });
    }
}

export function loadPlugin(name) {
    return new Promise(resolve => {
        const cbName = `__plugin_${ name }__`;

        const head = document.getElementsByTagName('head')[0];
        let script = null;

        window[cbName] = function(exports) {
            delete window[cbName];

            head.removeChild(script);
            resolve(exports);
        };

        script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.src = `/plugins/${ name }/assets/plugin.js`;
        head.appendChild(script);
    });
}

export function hoc(vals) {
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
