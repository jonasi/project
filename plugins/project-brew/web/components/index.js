import { brew } from './index.css';
import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Tabs, { Tab } from 'web/common/components/tabs';
import Link from 'web/common/components/link';

import { getVersion, getInstalled, getAll } from '../actions';
import brewImgURL from '../img/brew.png';

const { object, func } = PropTypes;

@connect(
    state => ({ version: state.get('version') }), 
    dispatch => bindActionCreators({ getVersion }, dispatch)
)
export default class BrewHome extends Component {
    static propTypes = {
        location: object.isRequired,
        version: object.isRequired,
        getVersion: func.isRequired,
    };

    componentWillMount() {
        this.props.getVersion();
    }

    render() {
        const { version, location } = this.props;

        if (!version.isSuccess()) {
            return null;
        }

        return (
            <div className={ brew }>
                <a href="http://brew.sh/" target="__blank">
                    <img src={ brewImgURL } />
                </a>
                { version.value.version } { version.value.revision }
                <Tabs location={ location }>
                    <Tab id="installed" label="Installed" renderFn={ () => <Installed /> } />
                    <Tab id="all" label="All" renderFn={ () => <All /> } />
                </Tabs>
            </div>
        );
    }
}

@connect(
    state => ({ installed: state.get('installed') }),
    dispatch => bindActionCreators({ getInstalled }, dispatch)
)
class Installed extends Component {
    static propTypes = {
        installed: object.isRequired,
        getInstalled: func.isRequired,
    };

    componentWillMount() {
        this.props.getInstalled();
    }

    render() {
        const { installed } = this.props;
        return <FormulaTable formulae={ installed } />;
    }
}

@connect(
    state => ({ all: state.get('all') }),
    dispatch => bindActionCreators({ getAll }, dispatch)
)
class All extends Component {
    static propTypes = {
        all: object.isRequired,
        getAll: func.isRequired,
    };

    componentWillMount() {
        this.props.getAll();
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
                        <th />
                    </tr>
                </thead>
                <tbody>{
                    formulae.value.map(f => {
                        const version = f.installed && f.installed.length ? 
                            f.installed.map(v => v.version).join(', ') : '';

                        return (
                            <tr key={ f.name }>
                                <td><Link to={ `/plugins/brew/web/${ f.name }` }>{ f.name }</Link></td>
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
