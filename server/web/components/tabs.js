import styles from './tabs.css';

import React, { Component, PropTypes, Children } from 'react';
import classnames from 'classnames';

import { Link } from 'react-router';

const { node, string, object, func } = PropTypes;

export class Tab extends Component {
    static propTypes = {
        id: string.isRequired,
        label: node,
        renderFn: func.isRequired,
    }

    render() {
        return this.props.renderFn();
    }
}

export default class extends Component {
    static contextTypes = {
        location: object.isRequired,
        history: object.isRequired,
    }

    static propTypes = {
        children: node.isRequired,
        defaultTab: string,
    }

    render() {
        const { children, defaultTab } = this.props;
        const { location: { pathname, query }, history: { createPath } } = this.context;

        const activeId = query.tab || defaultTab;
        const ch = Children.toArray(children);

        let active = ch.find(c => activeId && c.props.id === activeId);

        if (!active && ch.length) {
            active = ch[0];
        }

        return (
            <div className={ styles.container }>
                <ul className={ styles.tabs }>{
                    ch.map(c => {
                        const { id, label = id } = c.props;
                        const to = createPath(pathname, { ...query, tab: id });
                        const cls = classnames({ active: c === active });

                        return (
                            <li key={ id } className={ cls }>
                                <Link to={ to }>{ label }</Link>
                            </li>
                        )
                    })
                }</ul>
                <div className={ styles.content }>{ active }</div>
            </div>
        );
    }
}
