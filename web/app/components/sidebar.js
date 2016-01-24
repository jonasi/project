import styles from './sidebar.css';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';

import Link from 'web/common/components/link';

import { loadPlugins } from 'web/app/actions';
import { getPlugins } from 'web/app/state';

const { object, string, func } = PropTypes;

@connect(
    state => ({ plugins: getPlugins(state) }),
    dispatch => bindActionCreators({ loadPlugins }, dispatch)
)
export default class Sidebar extends Component {
    static propTypes = {
        plugins: object,
        className: string,
        loadPlugins: func.isRequired,
    };

    componentWillMount() {
        this.props.loadPlugins();
    }

    render() {
        const { plugins, className } = this.props;

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
