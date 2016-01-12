import styles from './container.css';
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

import Sidebar from './sidebar';

const { node } = PropTypes;
const ls = window.localStorage || {};
const lsKey = '__sidebar__closed__';

export default class extends Component {
    static propTypes = {
        children: node,
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            sidebarClosed: !!ls[lsKey],
        };
    }

    toggleSidebar() {
        this.setState({
            sidebarClosed: !this.state.sidebarClosed,
        });
    }

    render() {
        const { sidebarClosed } = this.state;
        ls[lsKey] = sidebarClosed ? "1" : "";

        return (
            <div className={ styles.container }>
                <Sidebar className={ classnames({
                    [styles.sidebar]: true,
                    [styles.hidden]: sidebarClosed,
                }) } />
                <div className={ styles.body }>
                    <header className={ styles.header }>
                        <button onClick={ () => this.toggleSidebar() }>{ sidebarClosed ? '>' : '<' }</button>
                    </header>
                    <div className={ styles.content }>{
                        this.props.children
                    }</div>
                </div>
            </div>
        );
    }
}
