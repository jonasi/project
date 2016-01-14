import { render } from 'web/common/app';

import routes from './routes';
import reducer from './state';
import actions from './actions';

render({ actions, reducer, routes, apiPrefix: '/plugins/system/api' });
