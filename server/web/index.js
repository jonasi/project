import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';
import { createHistory } from 'history';

import routes from 'web/routes';
import API from 'web/api';

const root = document.getElementById('react-root');
const api = new API();

class Root extends Component {
    static childContextTypes = {
        api: PropTypes.object,
    }

    getChildContext() {
        return { api };
    }

    render() {
        return this.props.children;
    }
}

render(
    <Root>
        <Router routes={ routes } history={ createHistory() } />
    </Root>, 
    root
);
