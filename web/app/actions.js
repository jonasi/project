import { createAPIAction } from 'web/common/redux';

export const GET_PLUGINS = '@@project/get_plugins';

// load all plugins from the api
export const loadPlugins = () => createAPIAction(GET_PLUGINS, `/plugins`);
