import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Container from 'web/components/container';
import Home from 'web/components/home';
import Brew from 'web/components/brew';
import System from 'web/components/system';

export default (
    <Route path="/" component={ Container }>
        <IndexRoute component={ Home } />
        <Route path="brew" component={ Brew } />
        <Route path="system" component={ System } />
    </Route>
)
