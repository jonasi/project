import { container } from './container.css';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { boundActions } from 'web/common/redux';
import { runCommand } from '../actions';
import { getHistory } from '../state';
import { push } from 'react-router-redux';

const { func, node, object } = PropTypes;

@connect(
    state => ({ history: getHistory(state) }),
    boundActions({ runCommand, push })
)
export default class ShellContainer extends Component {
    static propTypes = {
        runCommand: func.isRequired,
        push: func.isRequired,
        children: node,
        history: object,
    };

    componentWillReceiveProps(props) {
        const { history, push } = this.props;

        if (history.isSuccess() && props.history.isSuccess() && history.value.size && history.value.first() && history.value.first().id !== props.history.value.first().id) {
            push(`/plugins/shell/web/commands/${ props.history.value.first().id }`);
        }
    }

    onSubmit(e) {
        e.preventDefault();

        const { runCommand } = this.props;

        runCommand(this.refs.text.value);
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
