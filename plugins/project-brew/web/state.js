import { combineReducers } from 'redux';
import { createAPIReducer, createAPIMapReducer } from 'web/common/redux';

import {
    GET_VERSION,
    GET_INSTALLED,
    GET_ALL,
    GET_FORMULA,
} from './actions';

const version = createAPIReducer({ type: GET_VERSION });
const installed = createAPIReducer({ type: GET_INSTALLED });
const all = createAPIReducer({ type: GET_ALL });
const formula = createAPIMapReducer({ type: GET_FORMULA, selector: args => args.formula });

export default combineReducers({ version, installed, all, formula });
