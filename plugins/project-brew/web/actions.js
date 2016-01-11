export const GET_VERSION_REQ = 'get_version_req';
export const GET_VERSION_RESP = 'get_version_resp';

export const GET_INSTALLED_REQ = 'get_installed_req';
export const GET_INSTALLED_RESP = 'get_installed_resp';

export const GET_ALL_REQ = 'get_all_req';
export const GET_ALL_RESP = 'get_all_resp';

export const GET_FORMULA_REQ = 'get_formula_req';
export const GET_FORMULA_RESP = 'get_formula_resp';

export class Actions {
    constructor(api) {
        this.api = api;
    }

    getVersion() {
        return dispatch => {
            dispatch({ type: GET_VERSION_REQ });

            this.api.get(`/plugins/brew/api/version`)
                .then(version => dispatch({ type: GET_VERSION_RESP, version }));
        };
    }

    getInstalled() {
        return dispatch => {
            dispatch({ type: GET_INSTALLED_REQ });

            this.api.get(`/plugins/brew/api/formulae?filter=installed`)
                .then(installed => dispatch({ type: GET_INSTALLED_RESP, installed }));
        };
    }

    getAll() {
        return dispatch => {
            dispatch({ type: GET_ALL_REQ });

            this.api.get(`/plugins/brew/api/formulae?filter=all`)
                .then(all => dispatch({ type: GET_ALL_RESP, all }));
        };
    }

    getFormula(formula) {
        return dispatch => {
            dispatch({ type: GET_FORMULA_REQ });

            this.api.get(`/plugins/brew/api/formulae/${ formula }`)
                .then(formula => dispatch({ type: GET_FORMULA_RESP, formula }));
        };
    }
}
