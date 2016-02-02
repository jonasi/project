import { routeReducer } from 'react-router-redux';
import { combineReducers, push, replace } from 'web/common/redux';
export { syncHistory, push, replace, go, goBack, goForward } from 'react-router-redux';

export const reducer = combineReducers({ routing: routeReducer });
export const getLocation = state => state.routing.location;

const merge = actionCreator => newLoc => (dispatch, getState) => {
    let loc = getLocation(getState());
    loc = Object.assign({}, loc, newLoc);

    return dispatch(actionCreator(loc));
};

export const mergePush = merge(push);
export const mergeReplace = merge(replace);
