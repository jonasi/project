import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Index from './components/index';
import Formula from './components/formula';

export default (
    <Route path="/plugins/brew/web/">
        <IndexRoute component={ Index } />
        <Route path=":formula" component={ Formula } />
    </Route>
);

