import styles from './sidebar.css';

import React, { Component, PropTypes } from 'react';
import connect from 'web/common/connect';
import classnames from 'classnames';

import Link from 'web/common/components/link';

const { object, func, string } = PropTypes;

@connect(state => ({ plugins: state.get('plugins') }), ['loadPlugins'])
export default class Sidebar extends Component {
    static propTypes = {
        plugins: object,
        className: string,
        loadPlugins: func,
    };

    componentWillMount() {
        this.props.loadPlugins();
    }

    render() {
        const { plugins, className} = this.props;

        return (
            <div className={ classnames(styles.sidebar, className) }>
                <ul>{
                    plugins.map(({ name }) => (
                        <li key={ name }>
                            <Link activeClassName="active" to={ `/web/global/plugins/${ name }` } >{ name }</Link>
                        </li>
                    ))
                }</ul>
            </div>
        );
    }
}
