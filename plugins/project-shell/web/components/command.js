import React, { Component } from 'react';
import { connect } from 'react-redux';
import Tabs, { Tab } from 'web/common/components/tabs';

@connect((state, props) => ({
    command: state.getIn(['commands', props.params.id]),
}))
export default class Command extends Component {
    static propTypes = {
        params: React.PropTypes.object.isRequired,
        command: React.PropTypes.object,
    }

    static contextTypes = {
        actions: React.PropTypes.object,
    }

    componentWillMount() {
        const { dispatch, params } = this.props;
        const { actions } = this.context;

        dispatch(actions.getCommand(params.id));
    }

    render() {
        const { command } = this.props;

        if (!command) {
            return null;
        }

        return (
            <div>
                <h5>{ command.id }</h5>
                <Tabs>
                    <Tab id="stdout" label="Stdout" renderFn={ () => <Stdout id={ command.id } /> } />
                    <Tab id="stderr" label="Stderr" renderFn={ () => <Stderr id={ command.id } /> } />
                </Tabs>
            </div>
        );
    }
}

@connect((state, props) => ({
    stdout: state.getIn(['stdout', props.id]),
}))
class Stdout extends Component {
    static propTypes = {
        dispatch: React.PropTypes.func,
        id: React.PropTypes.string,
        stdout: React.PropTypes.string,
    }

    static contextTypes = {
        actions: React.PropTypes.object,
    }

    componentWillMount() {
        const { dispatch, id } = this.props;
        const { actions } = this.context;

        dispatch(actions.getStdout({ id }));
    }

    render() {
        const { stdout } = this.props;
        return <pre>{ stdout }</pre>;
    }
}

@connect((state, props) => ({
    stderr: state.getIn(['stderr', props.id]),
}))
class Stderr extends Component {
    static propTypes = {
        dispatch: React.PropTypes.func,
        id: React.PropTypes.string,
        stderr: React.PropTypes.string,
    }

    static contextTypes = {
        actions: React.PropTypes.object,
    }

    componentWillMount() {
        const { dispatch, id } = this.props;
        const { actions } = this.context;

        dispatch(actions.getStderr({ id }));
    }

    render() {
        const { stderr } = this.props;
        return <pre>{ stderr }</pre>;
    }
}
