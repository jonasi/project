import { brew } from './formulae.css';
import React, { Component, PropTypes } from 'react';

import { connect } from 'web/common/redux';
import Tabs, { Tab } from 'web/common/components/tabs';
import FormulaTable from './formula_table';
import Debug from 'web/common/components/debug';

import { loadEnv, loadConfig, loadVersion, loadInstalled, loadAll, search } from '../actions';
import { getEnv, getConfig, getVersion, getInstalled, getAll, getUpgradeable } from '../state';
import brewImgURL from '../img/brew.png';

const { object, func } = PropTypes;

@connect({
    mapState: state => ({ version: getVersion(state) }),
    bindActions: { search },
    onMount: () => loadVersion(),
})
export default class BrewHome extends Component {
    static propTypes = {
        version: object.isRequired,
        search: func.isRequired,
    };

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
                    <Tab id="config" label="Config" renderFn={ () => <Config /> } />
                    <Tab id="env" label="Env" renderFn={ () => <Env /> } />
                </Tabs>
            </div>
        );
    }
}

const Installed = connect({
    mapState: state => ({ formulae: getInstalled(state) }),
    onMount: () => loadInstalled(),
})(FormulaTable);

const Upgradeable = connect({
    mapState: state => ({ formulae: getUpgradeable(state) }),
    onMount: () => loadInstalled(),
})(FormulaTable);

const All = connect({
    mapState: state => ({ formulae: getAll(state) }),
    onMount: () => loadAll(),
})(FormulaTable);

@connect({
    mapState: state => ({ config: getConfig(state) }),
    onMount: () => loadConfig(),
})
class Config extends Component {
    static propTypes = {
        config: object.isRequired,
    };

    render() {
        const { config } = this.props;

        if (!config.isSuccess()) {
            return null;
        }

        return <Debug>{ config.value }</Debug>;
    }
}

@connect({
    mapState: state => ({ env: getEnv(state) }),
    onMount: () => loadEnv(),
})
class Env extends Component {
    static propTypes = {
        env: object.isRequired,
    };

    render() {
        const { env } = this.props;

        if (!env.isSuccess()) {
            return null;
        }

        return <Debug>{ env.value }</Debug>;
    }
}
