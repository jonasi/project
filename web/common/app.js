import 'web/common/styles';

import React from 'react';
import { render as reactRender } from 'react-dom';
import { Router } from 'react-router';
import Comm from './comm';
import Logger from './logger';

import API from 'web/common/api';

import ContextProvider from 'web/common/components/context_provider';

export default class App {
    constructor() {
        this.root = document.getElementById('react-root');
        this.logger = new Logger();
        this.api = new API();
        this.comm = new Comm(this.logger);
    }

    render({ routes, context = {} }) {
        const { api, logger, comm } = this;
        const Root = ContextProvider({ api, comm, logger, ...context });

        reactRender(
            <Root>
                <Router routes={ routes } history={ comm.history } />
            </Root>, 
            this.root
        );
    }
}
