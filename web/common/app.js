import 'web/common/styles';

import React from 'react';
import { render as reactRender } from 'react-dom';
import { Router } from 'react-router';
import Comm from './comm';
import Logger from './logger';
import { compose, createStore, applyMiddleware } from 'redux';
import { composeReducers, thunk } from 'web/common/redux';
import { syncHistory, reducer as routingReducer } from 'web/common/routing';

import API from 'web/common/api';

import ContextProvider from 'web/common/components/context_provider';
import DevTools from 'web/common/components/devtools';

export default class App {
    constructor({ reducer, routes, apiPrefix = '', webPrefix = ''}) {
        this.root = document.getElementById('react-root');
        this.logger = new Logger();
        this.api = new API(this.logger.child('api'), apiPrefix);
        this.comm = new Comm(this.logger.child('comm'), webPrefix);
        this.routes = routes;

        const middleware = [
            logActions(this.logger.child('redux')),
            thunk({ api: this.api }),
            syncHistory(this.comm.history),
        ];

        reducer = composeReducers(reducer, routingReducer);

        this.store = compose(
            applyMiddleware(...middleware),
            DevTools.instrument()
        )(createStore)(reducer);
    }

    render() {
        const { api, logger, comm, routes, store } = this;
        const Root = ContextProvider({ api, comm, logger, store });

        reactRender(
            <Root>
                <Router routes={ routes } history={ comm.history } />
            </Root>, 
            this.root
        );
    }
}

export function render(options) {
    const app = new App(options);
    app.render();

    return app;
}

function logActions(logger) {
    return () => next => action => {
        const ret = next(action);
        logger.debug('action dispatch', action, ret);

        return ret;
    };
}
