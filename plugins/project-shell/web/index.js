import App from 'web/common/app';
import routes from './routes';
import reducer from './state';
import { Actions } from './actions';

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const store = applyMiddleware(thunk)(createStore)(reducer);
const actions = new Actions();

const app = new App();
actions.api = app.api;
app.render({ routes, context: { store, actions } });
