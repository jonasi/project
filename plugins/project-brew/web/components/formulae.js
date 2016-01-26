import { brew } from './formulae.css';
import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';
import { boundActions } from 'web/common/redux';
import Tabs, { Tab } from 'web/common/components/tabs';
import Link from 'web/common/components/link';

import { loadVersion, loadInstalled, loadAll, search } from '../actions';
import { getVersion, getInstalled, getAll, getUpgradeable } from '../state';
import brewImgURL from '../img/brew.png';

const { object, func } = PropTypes;

@connect(
    state => ({ version: getVersion(state) }),
    boundActions({ loadVersion, search })
)
export default class BrewHome extends Component {
    static propTypes = {
        version: object.isRequired,
        loadVersion: func.isRequired,
        search: func.isRequired,
    };

    componentWillMount() {
        this.props.loadVersion();
    }

    onSubmit(e) {
        e.preventDefault();

        const v = (this.refs.search.value || '').trim();

        if (!v) {
            return;
        }

        this.props.search(v);
    }

    render() {
        const { version } = this.props;

        if (!version.isSuccess()) {
            return null;
        }

        return (
            <div className={ brew }>
                <a href="http://brew.sh/" target="__blank">
                    <img src={ brewImgURL } />
                </a>
                { version.value.version } { version.value.revision }
                <form onSubmit={ e => this.onSubmit(e) }>
                    <input ref="search" type="text" />
                    <input type="submit" />
                </form>
                <Tabs>
                    <Tab id="installed" label="Installed" renderFn={ () => <Installed /> } />
                    <Tab id="upgradeable" label="Upgradeable" renderFn={ () => <Upgradeable /> } />
                    <Tab id="all" label="All" renderFn={ () => <All /> } />
                </Tabs>
            </div>
        );
    }
}

@connect(
    state => ({ installed: getInstalled(state) }),
    boundActions({ loadInstalled })
)
class Installed extends Component {
    static propTypes = {
        installed: object.isRequired,
        loadInstalled: func.isRequired,
    };

    componentWillMount() {
        this.props.loadInstalled();
    }

    render() {
        const { installed } = this.props;
        return <FormulaTable formulae={ installed } />;
    }
}

@connect(
    state => ({ upgradeable: getUpgradeable(state) }),
    boundActions({ loadInstalled })
)
class Upgradeable extends Component {
    static propTypes = {
        upgradeable: object.isRequired,
        loadInstalled: func.isRequired,
    };

    componentWillMount() {
        this.props.loadInstalled();
    }

    render() {
        const { upgradeable } = this.props;
        return <FormulaTable formulae={ upgradeable } />;
    }
}

@connect(
    state => ({ all: getAll(state) }),
    boundActions({ loadAll })
)
class All extends Component {
    static propTypes = {
        all: object.isRequired,
        loadAll: func.isRequired,
    };

    componentWillMount() {
        this.props.loadAll();
    }

    render() {
        const { all } = this.props;
        return <FormulaTable formulae={ all } />;
    }
}

class FormulaTable extends Component {
    static propTypes = {
        formulae: object.isRequired,
    };

    render() {
        const { formulae } = this.props;

        if (!formulae.isSuccess()) {
            return null;
        }

        return (
            <table className="u-full-width">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>URL</th>
                        <th>Installed</th>
                        <th>Stable Version</th>
                        <th />
                    </tr>
                </thead>
                <tbody>{
                    formulae.value.map(f => {
                        const version = f.installed && f.installed.length ? 
                            f.installed.map(v => v.version).join(', ') : 'not installed';

                        return (
                            <tr key={ f.name }>
                                <td><Link to={ `/plugins/brew/web/${ f.name }` }>{ f.name }</Link></td>
                                <td>{ f.desc }</td>
                                <td><a target="_blank" href={ f.homepage }>Homepage</a></td>
                                <td>{ version }</td>
                                <td>{ f.versions.stable }</td>
                                <td><button>Remove</button></td>
                            </tr>
                        );
                    })
                }</tbody>
            </table>
        );
    }
}