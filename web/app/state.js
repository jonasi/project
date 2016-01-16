import { createAPIReducer } from 'web/common/redux';
import { combineReducers } from 'redux';

import {
    GET_PLUGINS,
} from './actions';

const plugins = createAPIReducer({ type: GET_PLUGINS });

export default combineReducers({ plugins });
