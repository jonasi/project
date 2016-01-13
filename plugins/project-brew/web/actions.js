import { createAPIAction } from 'web/common/redux';

export const GET_VERSION = 'get_version';
export const GET_INSTALLED = 'get_installed';
export const GET_ALL = 'get_all';
export const GET_FORMULA = 'get_formula';

export default function actions(api) {
    return {
        getVersion() {
            return createAPIAction({ api, type: GET_VERSION, path: `/version` });
        },

        getInstalled() {
            return createAPIAction({ api, type: GET_INSTALLED, path: `/formulae?filter=installed` });
        },

        getAll() {
            return createAPIAction({ api, type: GET_ALL, path: `/formulae?filter=all` });
        },

        getFormula(formula) {
            return createAPIAction({ api, type: GET_FORMULA, path: `/formulae/${ formula }`, formula });
        },
    };
}
