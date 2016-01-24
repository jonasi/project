import { render } from 'web/common/app';

import routes from './routes';
import { reducer } from './state';

render({
    reducer, routes,
    apiPrefix: '/plugins/brew/api',
});
