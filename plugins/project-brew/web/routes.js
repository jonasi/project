import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import Formulae from './components/formulae';
import Formula from './components/formula';

export default (
    <Route>
        <Redirect path="/plugins/brew" to="/plugins/brew/web" />
        <Route path="/plugins/brew/web">
            <IndexRoute component={ Formulae } />
            <Route path=":formula" component={ Formula } />
        </Route>
    </Route>
);
