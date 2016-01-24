import { Scope, combineReducers, createAPIReducer } from 'web/common/redux';

import {
    GET_PLUGINS,
} from './actions';

const ns = new Scope('app');

export const reducer = ns.reducer(combineReducers({
    plugins: createAPIReducer(GET_PLUGINS),
}));

export const getPlugins = ns.selector(state => state.plugins);
