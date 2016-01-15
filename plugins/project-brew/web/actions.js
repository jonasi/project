import { createAPIAction } from 'web/common/redux';

export const GET_VERSION = 'get_version';
export const GET_INSTALLED = 'get_installed';
export const GET_ALL = 'get_all';
export const GET_FORMULA = 'get_formula';

export function getVersion() {
    return createAPIAction({ type: GET_VERSION, path: `/version` });
}

export function getInstalled() {
    return createAPIAction({ type: GET_INSTALLED, path: `/formulae?filter=installed` });
}

export function getAll() {
    return createAPIAction({ type: GET_ALL, path: `/formulae?filter=all` });
}

export function getFormula(formula) {
    return createAPIAction({ type: GET_FORMULA, path: `/formulae/${ formula }`, formula });
}
