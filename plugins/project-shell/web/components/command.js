import React, { Component, PropTypes } from 'react';
import { connect } from 'web/common/redux';
import Tabs, { Tab } from 'web/common/components/tabs';
import { loadCommand, loadStdout, loadStderr } from '../actions';
import { getCommand, getStderr, getStdout } from '../state';

const { object, string } = PropTypes;

@connect({
    mapState: (state, props) => ({ command: getCommand(state, props.params.id) }),
    onMount: props => loadCommand(props.params.id),
})
export default class Command extends Component {
    static propTypes = {
        params: object.isRequired,
        command: object,
    };

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

@connect({
    mapState: (state, props) => ({ stdout: getStdout(state, props.id) }),
    onMount: props => loadStdout(props.id),
})
class Stdout extends Component {
    static propTypes = {
        id: string.isRequired,
        stdout: object,
    };

    render() {
        const { stdout } = this.props;
        return <pre>{ stdout && stdout.value }</pre>;
    }
}

@connect({
    mapState: (state, props) => ({ stderr: getStderr(state, props.id) }),
    onMount: props => loadStderr(props.id),
})
class Stderr extends Component {
    static propTypes = {
        id: string.isRequired,
        stderr: object,
    };

    render() {
        const { stderr } = this.props;
        return <pre>{ stderr && stderr.value }</pre>;
    }
}
