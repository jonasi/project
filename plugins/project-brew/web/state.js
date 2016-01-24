import { Scope, combineReducers, createAPIReducer, createAPIMapReducer } from 'web/common/redux';
import { createSelector } from 'reselect';

import {
    GET_VERSION,
    GET_INSTALLED,
    GET_ALL,
    GET_FORMULA,
} from './actions';

const ns = new Scope('brew');

const version = createAPIReducer(GET_VERSION);
const installed = createAPIReducer(GET_INSTALLED);
const all = createAPIReducer(GET_ALL);
const formula = createAPIMapReducer(GET_FORMULA, ctxt => ctxt.formula);

export const reducer = ns.reducer(combineReducers({ version, installed, all, formula }));

export const getVersion = ns.selector(state => state.version);
export const getFormula = ns.selector((state, f) => state.formula.get(f));
export const getInstalled = ns.selector(state => state.installed);
export const getAll = ns.selector(state => state.all);
export const getUpgradeable = ns.selector(createSelector(
    getInstalled, 
    formulae => formulae.filter(f => f.version.stable !== f.installed[0].version)
));
