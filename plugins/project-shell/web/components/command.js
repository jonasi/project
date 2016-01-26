import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { boundActions } from 'web/common/redux';
import Tabs, { Tab } from 'web/common/components/tabs';
import { loadCommand, loadStdout, loadStderr } from '../actions';
import { getCommand, getStderr, getStdout } from '../state';

const { object, string, func } = PropTypes;

@connect(
    (state, props) => ({ command: getCommand(state, props.params.id) }),
    boundActions({ loadCommand })
)
export default class Command extends Component {
    static propTypes = {
        params: object.isRequired,
        command: object,
        loadCommand: func.isRequired,
    };

    componentWillMount() {
        const { loadCommand, params } = this.props;
        loadCommand(params.id);
    }

    render() {
        const { command } = this.props;

        if (!command || !command.isSuccess()) {
            return null;
        }

        return (
            <div>
                <h5>{ command.value.id }</h5>
                <Tabs>
                    <Tab id="stdout" label="Stdout" renderFn={ () => <Stdout id={ command.value.id } /> } />
                    <Tab id="stderr" label="Stderr" renderFn={ () => <Stderr id={ command.value.id } /> } />
                </Tabs>
            </div>
        );
    }
}

@connect(
    (state, props) => ({ stdout: getStdout(state, props.id) }),
    boundActions({ loadStdout })
)
class Stdout extends Component {
    static propTypes = {
        id: string.isRequired,
        stdout: object,
        loadStdout: func.isRequired,
    };

    componentWillMount() {
        const { loadStdout, id } = this.props;
        loadStdout(id);
    }

    render() {
        const { stdout } = this.props;
        return <pre>{ stdout && stdout.value }</pre>;
    }
}

@connect(
    (state, props) => ({ stderr: getStderr(state, props.id) }),
    boundActions({ loadStderr })
)
class Stderr extends Component {
    static propTypes = {
        id: string.isRequired,
        stderr: object,
        loadStderr: func.isRequired,
    };

    componentWillMount() {
        const { loadStderr, id } = this.props;
        loadStderr(id);
    }

    render() {
        const { stderr } = this.props;
        return <pre>{ stderr && stderr.value }</pre>;
    }
}
