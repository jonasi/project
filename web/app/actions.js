export const GET_PLUGINS_REQ = 'get_plugins_req';
export const GET_PLUGINS_RESP = 'get_plugins_resp';

export class Actions {
    constructor(api) {
        this.api = api;
    }

    loadPlugins() {
        return dispatch => {
            dispatch({ type: GET_PLUGINS_REQ });

            return this.api.get(`/api/plugins`)
                .then(plugins => dispatch({ type: GET_PLUGINS_RESP, plugins }));
        };
    }
}
