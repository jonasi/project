import styles from './sidebar.css';

import React, { Component, PropTypes } from 'react';
import { connect } from 'web/common/redux';
import classnames from 'classnames';

import Link from 'web/common/components/link';

const { object, string } = PropTypes;

@connect({
    state: state => ({ plugins: state.get('plugins') }),
    onMount: ['loadPlugins'],
})
export default class Sidebar extends Component {
    static propTypes = {
        plugins: object,
        className: string,
    };

    render() {
        const { plugins, className} = this.props;

        if (!plugins.isSuccess()) {
            return null;
        }

        return (
            <div className={ classnames(styles.sidebar, className) }>
                <ul>{
                    plugins.value.map(({ name }) => (
                        <li key={ name }>
                            <Link activeClassName="active" to={ `/web/global/plugins/${ name }` } >{ name }</Link>
                        </li>
                    ))
                }</ul>
            </div>
        );
    }
}
