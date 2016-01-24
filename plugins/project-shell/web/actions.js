import { createAPIAction } from 'web/common/redux';

export const POST_COMMAND = 'post_command';
export const GET_COMMANDS = 'get_commands';
export const GET_COMMAND = 'get_command';
export const GET_STDOUT = 'get_stdout';
export const GET_STDERR = 'get_stderr';

export const loadHistory = () => createAPIAction(GET_COMMANDS, `/commands`);

export const loadCommand = id => createAPIAction(GET_COMMAND, `/commands/${ id }`, { context: { id } });

export const runCommand = args => {
    const cid = randomId();
    args = ['sh', '-c', args];

    const body = JSON.stringify({ args });
    const opts = { method: 'post', fetchOptions: { body }, context: { args, cid } };

    return createAPIAction(POST_COMMAND, `/commands`, opts);
};

export const loadStdout = id => createAPIAction(GET_STDOUT, `/commands/${ id }/stdout`, { context: { id } });
export const loadStderr = id => createAPIAction(GET_STDERR, `/commands/${ id }/stderr`, { context: { id } });

function randomId() {
    return String(Math.random()).substr(2);
}
