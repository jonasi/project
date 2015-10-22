import skeleton from 'skeleton.css/skeleton.css'; 
import { brew } from './brew.css';
import React, { Component, PropTypes } from 'react';

import Tabs, { Tab } from 'web/components/tabs';

import brewImgURL from 'web/img/brew.png';

const { object } = PropTypes;

export default class extends Component {
    render() {
        return (
            <div className={ brew }>
                <a href="http://brew.sh/" target="__blank">
                    <img src={ brewImgURL } />
                </a>
                <Tabs>
                    <Tab id="installed" label="Installed" renderFn={ () => <Installed /> } />
                    <Tab id="all" label="All" renderFn={ () => <h1>HI</h1> } />
                    <Tab id="search" label="Search" renderFn={ () => <h1>YOI</h1> } />
                </Tabs>
            </div>
        );
    }
}

class Installed extends Component {
    static contextTypes = {
        api: object.isRequired,
    }

    constructor(props, context) {
        super(props, context);

        this.state = {
            formulae: [],
        };
    }

    componentWillMount() {
        const { api } = this.context;

        api.brew.formulae()
            .then(formulae => this.setState({ formulae }));
    }

    render() {
        const { formulae } = this.state;

        return (
            <table className={ skeleton['u-full-width'] }>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>URL</th>
                    </tr>
                </thead>
                <tbody>{
                    formulae.map(f => {
                        return (
                            <tr key={ f.name }>
                                <td>{ f.name }</td>
                                <td><a target="_blank" href={ f.homepage }>{ f.homepage }</a></td>
                            </tr>
                        );
                    })
                }</tbody>
            </table>
        );
    }
}
