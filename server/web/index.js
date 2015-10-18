import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';
import { createHistory } from 'history';

import routes from 'web/routes';

const root = document.getElementById('react-root');

render(
    <Router routes={ routes } history={ createHistory() } />, 
    root
);
