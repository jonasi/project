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
                    <h4><Link to="/">Projay</Link></h4>
                </header>
                <div className={ styles.body }>
                    <div className={ styles.sidebar }>
                        <ul>
                            <li><Link activeClassName="active" to="/brew">Brew</Link></li>
                            <li><Link activeClassName="active" to="/system">System</Link></li>
                        </ul>
                    </div>
                    <div className={ styles.content }>{
                        this.props.children
                    }</div>
                </div>
            </div>
        );
    }
}
