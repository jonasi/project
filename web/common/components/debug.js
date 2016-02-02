import React, { Component, PropTypes } from 'react';

const { any } = PropTypes;

export default class Debug extends Component {
    static propTypes = {
        children: any,
    };

    render() {
        const { children } = this.props;
        return <pre>{ JSON.stringify(children, null, "\t") }</pre>;
    }
}
