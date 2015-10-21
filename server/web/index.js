import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';
import { createHistory } from 'history';

import routes from 'web/routes';
import API from 'web/api';

import ContextProvider from 'web/components/context_provider';

const root = document.getElementById('react-root');
const api = new API();

const Root = ContextProvider({ api });

render(
    <Root>
        <Router routes={ routes } history={ createHistory() } />
    </Root>, 
    root
);
