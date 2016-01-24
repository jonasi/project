import { createAPIAction } from 'web/common/redux';

export const GET_PLUGINS = 'get_plugins';

export const loadPlugins = () => createAPIAction(GET_PLUGINS, `/plugins`);
