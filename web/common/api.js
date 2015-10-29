import 'whatwg-fetch';

import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import ValueState from './value_state';

const { object } = PropTypes;

const { fetch } = window;

export default class API {
    call(...args) {
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

        results = results.set(k, new ValueState({
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
            const { results } = this.state;

            for (const k in vals) {
                const path = vals[k].path(this.props);
                results.set(k, results.get(k).setLoading());

                api.call(path, {
                    method: 'get',
                })
                    .then(val => this._mergeResults(k, val))
                    .catch(error => this._mergeResults(k, void 0, error));
            }

            this.setState({ results });
        }

        _mergeResults(k, value, error) {
            const { results } = this.state;
            let v;

            if (arguments.length === 2) {
                v = results.get(k).setValue(value);
            } else {
                v = results.get(k).setError(error);
            }

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
