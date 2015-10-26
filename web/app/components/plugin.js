import styles from './plugin.css';
import React, { Component, PropTypes } from 'react';

const { object } = PropTypes;

export default class extends Component {
    static propTypes = {
        params: object.isRequired,
        location: object.isRequired,
    }

    static contextTypes = {
        comm: object.isRequired,
    }

    constructor(props, context) {
        super(props, context);

        this._src = this.buildSrc(props);
    }

    componentWillReceiveProps(props) {
        const { comm } = this.context;
        const src = this.buildSrc(props);

        if (this._src !== src) {
            this._src = src;

            comm.dispatchHistoryMsg(this.refs.child, '_replaceState', [null, src]);
        }
    }

    buildSrc(props = this.props) {
        const { 
            params: { plugin, splat },
            location: { search },
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