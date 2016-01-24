import { createAPIAction } from 'web/common/redux';

export const GET_VERSION = 'get_version';
export const GET_INSTALLED = 'get_installed';
export const GET_ALL = 'get_all';
export const GET_FORMULA = 'get_formula';
export const POST_FORMULA = 'post_formula';
export const DELETE_FORMULA = 'delete_formula';
export const POST_SEARCH = 'post_search';

export const loadVersion = () => createAPIAction(GET_VERSION, `/version`);
export const loadInstalled = () => createAPIAction(GET_INSTALLED, `/installed`);
export const loadAll = () => createAPIAction(GET_ALL, `/formulae`);
export const loadFormula = formula => createAPIAction(GET_FORMULA, `/formulae/${ formula }`, { context: { formula } });
export const install = formula => createAPIAction(POST_FORMULA, `/installed/${ formula }`, { method: 'post', context: { formula } });
export const uninstall = formula => createAPIAction(GET_FORMULA, `/installed/${ formula }`, { method: 'delete', context: { formula } });
export const search = query => createAPIAction(POST_SEARCH, `/search?q=${ query }`);
