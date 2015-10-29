import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import Index from './components/index';

export default (
    <Route>
        <Redirect path="/plugins/shell" to="/plugins/shell/web" />
        <Route path="/plugins/shell/web">
            <IndexRoute component={ Index } />
        </Route>
    </Route>
);
