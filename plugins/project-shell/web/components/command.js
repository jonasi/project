import React, { Component } from 'react';
import connect from 'web/common/connect';
import Tabs, { Tab } from 'web/common/components/tabs';

@connect((state, props) => ({
    command: state.getIn(['commands', props.params.id]),
}), ['getCommand'])
export default class Command extends Component {
    static propTypes = {
        getCommand: React.PropTypes.func.isRequired,
        params: React.PropTypes.object.isRequired,
        command: React.PropTypes.object,
    }

    componentWillMount() {
        const { getCommand, params } = this.props;

        getCommand(params.id);
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
}), ['getStdout'])
class Stdout extends Component {
    static propTypes = {
        getStdout: React.PropTypes.func,
        id: React.PropTypes.string,
        stdout: React.PropTypes.string,
    }

    componentWillMount() {
        const { getStdout, id } = this.props;

        getStdout({ id });
    }

    render() {
        const { stdout } = this.props;
        return <pre>{ stdout }</pre>;
    }
}

@connect((state, props) => ({
    stderr: state.getIn(['stderr', props.id]),
}), ['getStderr'])
class Stderr extends Component {
    static propTypes = {
        getStderr: React.PropTypes.func,
        id: React.PropTypes.string,
        stderr: React.PropTypes.string,
    }

    componentWillMount() {
        const { getStderr, id } = this.props;
        getStderr({ id });
    }

    render() {
        const { stderr } = this.props;
        return <pre>{ stderr }</pre>;
    }
}
