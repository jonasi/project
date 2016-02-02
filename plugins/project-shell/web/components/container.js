import { container } from './container.css';
import React, { Component, PropTypes } from 'react';
import { connect } from 'web/common/redux';
import { runCommand } from '../actions';

const { func, node } = PropTypes;

@connect({
    bindActions: { runCommand },
})
export default class ShellContainer extends Component {
    static propTypes = {
        runCommand: func.isRequired,
        children: node,
    };

    onSubmit(e) {
        e.preventDefault();

        this.props.runCommand(this.refs.text.value);
    }

    render() {
        const { children } = this.props;

        return (
            <div className={ container }>
                <form onSubmit={ e => this.onSubmit(e) }>
                    <input type="text" ref="text" />
                    <input className="button-primary" type="submit" value="Run" />
                </form>
                { children }
            </div>
        );
    }
}
