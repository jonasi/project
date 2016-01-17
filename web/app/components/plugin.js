import styles from './plugin.css';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

const { object, string } = PropTypes;

@connect(state => ({ search: state.routing.location.search }))
export default class Plugin extends Component {
    static propTypes = {
        params: object.isRequired,
        search: string.isRequired,
    };

    static contextTypes = {
        comm: object.isRequired,
    };

    constructor(props, context) {
        super(props, context);

        this._plugin = props.params.plugin;
        this._src = this.buildSrc(props);
    }

    componentWillReceiveProps(props) {
        const { comm } = this.context;
        const { plugin } = props.params;
        const src = this.buildSrc(props);

        if (plugin != this._plugin) {
            this._src = src;
            this._plugin = plugin;
            this.forceUpdate();
            return;
        }

        if (this._src !== src) {
            this._src = src;
            comm.dispatchHistoryMsg(this.refs.child, '_replace', src);
        }
    }

    buildSrc(props = this.props) {
        const { 
            params: { plugin, splat },
            search,
        } = props;

        let src = `/plugins/${ plugin }`;

        if (splat) {
            if (src[src.length - 1] !== '/') {
                src += '/';
            }

            src += splat;
        }

        if (search) {
            src += search;
        }

        return src;
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div className={ styles.plugin }>
                <iframe ref="child" src={ this._src }  frameBorder="0" />
            </div>
        );
    }
}
