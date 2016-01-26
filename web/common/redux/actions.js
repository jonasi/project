export function createAPIAction(type, path, { guard, fetchOptions, method = 'get', context } = {}) {
    return (dispatch, getState, { api }) => {
        if (guard && guard(getState())) {
            return;
        }

        dispatch({ type, payload: { kind: 'request', context } });

        return api[method](path, fetchOptions)
            .then(body => dispatch({ type, payload: { kind: 'response', body, context } }));
    };
}
