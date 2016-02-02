import { Scope, combineReducers, createAPIReducer, createAPIMapReducer } from 'web/common/redux';

import {
    GET_VERSION,
    GET_INSTALLED,
    GET_ALL,
    GET_FORMULA,
    POST_SEARCH,
    GET_CONFIG,
    GET_ENV,
} from './actions';

const ns = new Scope('brew');

export const reducer = ns.reducer(combineReducers({
    version: createAPIReducer(GET_VERSION),
    installed: createAPIReducer(GET_INSTALLED),
    all: createAPIReducer(GET_ALL),
    formula: createAPIMapReducer(GET_FORMULA, ctxt => ctxt.formula),
    search: createAPIMapReducer(POST_SEARCH, ctxt => ctxt.query),
    config: createAPIReducer(GET_CONFIG),
    env: createAPIReducer(GET_ENV),
}));

export const getVersion = ns.selector(state => state.version);
export const getFormula = ns.selector((state, f) => state.formula.get(f));
export const getInstalled = ns.selector(state => state.installed);
export const getAll = ns.selector(state => state.all);
export const getSearchResults = ns.selector((state, query) => state.search.get(query));
export const getConfig = ns.selector(state => state.config);
export const getEnv = ns.selector(state => state.env);

export const getUpgradeable = ns.selector(
    getInstalled.unscoped,
    formulae => formulae.transformValue(v => v ? v.filter(f => f.versions.stable !== f.installed[0].version) : v)
);
