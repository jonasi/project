import 'web/common/styles';

import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';
import { createHistory } from 'history';

import routes from './routes';
import API from 'web/common/api';

import ContextProvider from 'web/common/components/context_provider';

const root = document.getElementById('react-root');
const api = new API();

const Root = ContextProvider({ api });

render(
    <Root>
        <Router routes={ routes } history={ createHistory() } />
    </Root>, 
    root
);
