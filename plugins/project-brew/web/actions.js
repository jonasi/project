import { createAPIAction } from 'web/common/redux';

export const GET_VERSION = '@@project/brew/get_version';
export const GET_INSTALLED = '@@project/brew/get_installed';
export const GET_ALL = '@@project/brew/get_all';
export const GET_FORMULA = '@@project/brew/get_formula';
export const POST_FORMULA = '@@project/brew/post_formula';
export const DELETE_FORMULA = '@@project/brew/delete_formula';
export const POST_SEARCH = '@@project/brew/post_search';

// load the brew version from the api
export const loadVersion = () => createAPIAction(GET_VERSION, `/version`);

// load all installed formulae from the api
export const loadInstalled = () => createAPIAction(GET_INSTALLED, `/installed`);

// load all formulae from the api
export const loadAll = () => createAPIAction(GET_ALL, `/formulae`);

// load a specific formula from the api
export const loadFormula = formula => createAPIAction(GET_FORMULA, `/formulae/${ formula }`, { context: { formula } });

// install the latest stable version of a formula
export const install = formula => createAPIAction(POST_FORMULA, `/installed/${ formula }`, { method: 'post', context: { formula } });

// remove the installed version of a formula
export const uninstall = formula => createAPIAction(GET_FORMULA, `/installed/${ formula }`, { method: 'delete', context: { formula } });

// load all formulae that match a given query
export const search = query => createAPIAction(POST_SEARCH, `/search?q=${ query }`, { context: { query } });
