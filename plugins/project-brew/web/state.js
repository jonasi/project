import { Scope, combineReducers, createAPIReducer, createAPIMapReducer } from 'web/common/redux';

import {
    GET_VERSION,
    GET_INSTALLED,
    GET_ALL,
    GET_FORMULA,
    POST_SEARCH,
} from './actions';

const ns = new Scope('brew');

const version = createAPIReducer(GET_VERSION);
const installed = createAPIReducer(GET_INSTALLED);
const all = createAPIReducer(GET_ALL);
const formula = createAPIMapReducer(GET_FORMULA, ctxt => ctxt.formula);
const search = createAPIMapReducer(POST_SEARCH, ctxt => ctxt.query);

export const reducer = ns.reducer(combineReducers({ version, installed, all, formula, search }));

export const getVersion = ns.selector(state => state.version);
export const getFormula = ns.selector((state, f) => state.formula.get(f));
export const getInstalled = ns.selector(state => state.installed);
export const getAll = ns.selector(state => state.all);
export const getSearchResults = ns.selector((state, query) => state.search.get(query));

export const getUpgradeable = ns.selector(
    getInstalled.unscoped,
    formulae => formulae.transformValue(v => v ? v.filter(f => f.versions.stable !== f.installed[0].version) : v)
);
