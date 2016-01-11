import App from 'web/common/app';
import routes from './routes';
import reducer from './state';
import { Actions } from './actions';

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const store = applyMiddleware(thunk)(createStore)(reducer);

const app = new App();
const actions = new Actions(app.api);

app.render({ routes, context: { store, actions } });
