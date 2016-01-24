export function createAPIAction(type, path, { fetchOptions, method = 'get', context } = {}) {
    return (dispatch, getState, { api }) => {
        dispatch({ type, payload: { kind: 'request', context } });

        return api[method](path, fetchOptions)
            .then(body => dispatch({ type, payload: { kind: 'response', body, context } }));
    };
}
