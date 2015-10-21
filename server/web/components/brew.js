import { brew } from './brew.css';
import React, { Component } from 'react';

import Tabs, { Tab } from 'web/components/tabs';

import brewImgURL from 'web/img/brew.png';

export default class extends Component {
    render() {
        return (
            <div className={ brew }>
                <a href="http://brew.sh/" target="__blank">
                    <img src={ brewImgURL } />
                </a>
                <Tabs>
                    <Tab id="installed" label="Installed" renderFn={ () => <h1>OK</h1> } />
                    <Tab id="all" label="All" renderFn={ () => <h1>HI</h1> } />
                    <Tab id="search" label="Search" renderFn={ () => <h1>YOI</h1> } />
                </Tabs>
            </div>
        );
    }
}
