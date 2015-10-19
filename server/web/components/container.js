import styles from './container.css';
import React, { Component, PropTypes } from 'react';

import { Link } from 'react-router';

const { node } = PropTypes;

export default class extends Component {
    static propTypes = {
        children: node,
    }

    render() {
        return (
            <div className={ styles.container }>
                <header className={ styles.header }>
                    <Link to="/">Projay</Link>
                </header>
                <div className={ styles.content }>{
                    this.props.children
                }</div>
            </div>
        );
    }
}
