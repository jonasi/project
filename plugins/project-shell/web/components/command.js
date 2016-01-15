import React, { Component, PropTypes } from 'react';
import { connect } from 'web/common/redux';
import Tabs, { Tab } from 'web/common/components/tabs';

const { object, string } = PropTypes;

@connect({
    state: (state, props) => ({ command: state.getIn(['commands', 'value', props.params.id]) }),
    onMount: (actions, props) => actions.getCommand(props.params.id),
})
export default class Command extends Component {
    static propTypes = {
        params: object.isRequired,
        location: object.isRequired,
        command: object,
    };

    render() {
        const { command, location } = this.props;

        if (!command.isSuccess()) {
            return null;
        }

        return (
            <div>
                <h5>{ command.value.id }</h5>
                <Tabs location={ location }>
                    <Tab id="stdout" label="Stdout" renderFn={ () => <Stdout id={ command.value.id } /> } />
                    <Tab id="stderr" label="Stderr" renderFn={ () => <Stderr id={ command.value.id } /> } />
                </Tabs>
            </div>
        );
    }
}

@connect({
    state: (state, props) => ({ stdout: state.getIn(['stdout', props.id]) }),
    onMount: (actions, props) => actions.getStdout(props.id),
})
class Stdout extends Component {
    static propTypes = {
        id: string.isRequired,
        stdout: object,
    };

    render() {
        const { stdout } = this.props;
        return <pre>{ stdout.value }</pre>;
    }
}

@connect({
    state: (state, props) => ({ stderr: state.getIn(['stderr', props.id]) }),
    onMount: (actions, props) => actions.getStderr(props.id),
})
class Stderr extends Component {
    static propTypes = {
        id: string.isRequired,
        stderr: object,
    };

    render() {
        const { stderr } = this.props;
        return <pre>{ stderr.value }</pre>;
    }
}
