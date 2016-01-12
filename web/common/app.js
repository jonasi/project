import 'web/common/styles';

import React from 'react';
import { render as reactRender } from 'react-dom';
import { Router } from 'react-router';
import Comm from './comm';
import Logger from './logger';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import API from 'web/common/api';

import ContextProvider from 'web/common/components/context_provider';

export default class App {
    constructor({ Actions, reducer, routes }) {
        this.root = document.getElementById('react-root');
        this.logger = new Logger();
        this.api = new API();
        this.comm = new Comm(this.logger);
        this.actions = new Actions(this.api);
        this.store = applyMiddleware(thunk)(createStore)(reducer);
        this.routes = routes;
    }

    render() {
        const { api, logger, comm, routes, store, actions } = this;
        const Root = ContextProvider({ api, comm, logger, store, actions });

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
