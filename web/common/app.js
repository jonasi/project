import 'web/common/styles';

import React from 'react';
import { render as reactRender } from 'react-dom';
import { Router } from 'react-router';
import Comm from './comm';

import API from 'web/common/api';

import ContextProvider from 'web/common/components/context_provider';

export function render({ routes, context = {} }) {
    const root = document.getElementById('react-root');
    const api = new API();
    const comm = new Comm();

    const Root = ContextProvider({ api, comm, ...context });

    reactRender(
        <Root>
            <Router routes={ routes } history={ comm.history } />
        </Root>, 
        root
    );

    return {
        api, routes, history, comm,
    };
}
