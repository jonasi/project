import { createAPIAction } from 'web/common/redux';

export const GET_PLUGINS = 'get_plugins';

export default function actions(api) {
    return {
        loadPlugins() {
            return createAPIAction({ api, type: GET_PLUGINS, path: `/plugins` });
        },
    };
}
