import React from 'react';
import { Route } from 'react-router';

import Container from 'web/components/container';
import Home from 'web/components/home';

export default (
    <Route component={ Container }>
        <Route path="/" component={ Home } />
    </Route>
)
