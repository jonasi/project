import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Container from './components/container';
import Home from './components/home';
import Plugin from './components/plugin';

export default (
    <Route path="/web/" component={ Container }>
        <IndexRoute component={ Home } />

        /* global/plugin/:plugin(/*) doesnt work */
        <Route path="global/plugin/:plugin" component={ Plugin } />
        <Route path="global/plugin/:plugin/*" component={ Plugin } />
    </Route>
);
