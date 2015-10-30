import { render } from 'web/common/app';
import routes from './routes';
import reducer from './reducers';

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const store = applyMiddleware(thunk)(createStore)(reducer);

render({ routes, context: { store } });
