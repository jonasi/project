import { render } from 'web/common/app';

import routes from './routes';
import reducer from './state';
import { Actions } from './actions';

render({ Actions, reducer, routes });
