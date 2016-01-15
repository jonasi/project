import 'web/common/styles';

import React from 'react';
import { render as reactRender } from 'react-dom';
import { Router } from 'react-router';
import Comm from './comm';
import Logger from './logger';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'web/common/redux';

import API from 'web/common/api';

import ContextProvider from 'web/common/components/context_provider';

export default class App {
    constructor({ reducer, routes, apiPrefix = '', webPrefix = ''}) {
        this.root = document.getElementById('react-root');
        this.logger = new Logger();
        this.api = new API(apiPrefix);
        this.comm = new Comm(this.logger, webPrefix);
        this.store = applyMiddleware(thunk({ api: this.api }))(createStore)(reducer);
        this.routes = routes;
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
