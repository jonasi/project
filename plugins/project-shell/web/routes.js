import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import Container from './components/container';
import Index from './components/index';
import Command from './components/command';

export default (
    <Route component={ Container }>
        <Redirect path="/plugins/shell" to="/plugins/shell/web" />
        <Route path="/plugins/shell/web">
            <IndexRoute component={ Index } />
            <Route path="commands/:id">
                <IndexRoute component={ Command } />
            </Route>
        </Route>
    </Route>
);
