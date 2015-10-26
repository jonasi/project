import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import Container from './components/container';
import Home from './components/home';
import Plugin from './components/plugin';

export default (
    <Route> 
        <Redirect path="/" to="/web/" />
        <Route path="/web/" component={ Container }>
            <IndexRoute component={ Home } />

            /* global/plugin/:plugin(/*) doesnt work */
            <Route path="global/plugins/:plugin" component={ Plugin } />
            <Route path="global/plugins/:plugin/*" component={ Plugin } />
        </Route>
    </Route>
);
