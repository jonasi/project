export function thunk(context = {}) {
    return store => next => action => {
        return typeof action === 'function' ?
            action(store.dispatch, store.getState, context) :
            next(action);
    };
}
