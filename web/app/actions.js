import { createAPIAction } from 'web/common/redux';

export const GET_PLUGINS = 'get_plugins';

export function loadPlugins() {
    return createAPIAction({ type: GET_PLUGINS, path: `/plugins` });
}
