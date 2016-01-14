import { container } from './container.css';
import React, { Component, PropTypes } from 'react';
import { connect } from 'web/common/redux';

const { func, node, object } = PropTypes;

@connect({
    state: state => ({ commands: state.get('commands') }),
    actions: ['runCommand'],
})
export default class ShellContainer extends Component {
    static propTypes = {
        runCommand: func.isRequired,
        children: node,
        commands: object,
    };

    static contextTypes = {
        history: object.isRequired,
    };

    componentWillReceiveProps(props) {
        const { history } = this.context;
        const { commands } = this.props;

        if (commands.isSuccess() && props.commands.isSuccess() && commands.value.size && commands.value.first().value.id !== props.commands.value.first().value.id) {
            history.push(`/plugins/shell/web/commands/${ props.commands.value.first().value.id }`);
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
