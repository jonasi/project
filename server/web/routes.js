import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Container from 'web/components/container';
import Home from 'web/components/home';
import Brew from 'web/components/brew';
import BrewFormula from 'web/components/brew/formula';
import Todo from 'web/components/todo';

export default (
    <Route path="/" component={ Container }>
        <IndexRoute component={ Home } />
        <Route path="brew">
            <IndexRoute component={ Brew } />
            <Route path=":name" component={ BrewFormula } />
        </Route>
        <Route path="system" component={ Todo } />
        <Route path="github" component={ Todo } />
        <Route path="bitbucket" component={ Todo } />
    </Route>
);
