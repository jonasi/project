import { brew } from './index.css';
import React, { Component, PropTypes } from 'react';

import api from 'web/components/api';
import Tabs, { Tab } from 'web/components/tabs';
import { Link } from 'react-router';

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
                    <Tab id="all" label="All" renderFn={ () => <All /> } />
                </Tabs>
            </div>
        );
    }
}

@api({
    formulae: {
        initialValue: [],
        path: () => '/api/brew/formulae?filter=installed',
    },
})
class Installed extends Component {
    static propTypes = {
        formulae: object.isRequired,
    }

    render() {
        const { formulae } = this.props;
        return <FormulaTable formulae={ formulae } />;
    }
}

@api({
    formulae: {
        initialValue: [],
        path: () => '/api/brew/formulae?filter=all',
    },
})
class All extends Component {
    static propTypes = {
        formulae: object.isRequired,
    }

    render() {
        const { formulae } = this.state;
        return <FormulaTable formulae={ formulae } />;
    }
}

class FormulaTable extends Component {
    static propTypes = {
        formulae: object.isRequired,
    }

    render() {
        const { formulae } = this.props;

        return (
            <table className="u-full-width">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>URL</th>
                        <th>Installed</th>
                        <th />
                    </tr>
                </thead>
                <tbody>{
                    formulae.value.map(f => {
                        const version = f.installed && f.installed.length ? 
                            f.installed.map(v => v.version).join(', ') : '';

                        return (
                            <tr key={ f.name }>
                                <td><Link to={ `/brew/${ f.name }` }>{ f.name }</Link></td>
                                <td>{ f.desc }</td>
                                <td><a target="_blank" href={ f.homepage }>Homepage</a></td>
                                <td>{ version }</td>
                                <td><button>Remove</button></td>
                            </tr>
                        );
                    })
                }</tbody>
            </table>
        );
    }
}
