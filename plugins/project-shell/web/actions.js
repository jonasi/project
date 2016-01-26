import { createAPIAction } from 'web/common/redux';

export const POST_COMMAND = '@@project/shell/post_command';
export const GET_COMMANDS = '@@project/shell/get_commands';
export const GET_COMMAND = '@@project/shell/get_command';
export const GET_STDOUT = '@@project/shell/get_stdout';
export const GET_STDERR = '@@project/shell/get_stderr';

// load all commands run from the api
export const loadHistory = () => createAPIAction(GET_COMMANDS, `/commands`);

// load a specific command from the api
export const loadCommand = id => createAPIAction(GET_COMMAND, `/commands/${ id }`, { context: { id } });

// run a command
// all args will be passed to 'sh -c' before being sent to the api
export const runCommand = args => {
    const cid = randomId();
    args = ['sh', '-c', args];

    const body = JSON.stringify({ args });
    const opts = { method: 'post', fetchOptions: { body }, context: { args, cid } };

    return createAPIAction(POST_COMMAND, `/commands`, opts);
};

// load the stdout response from the api
export const loadStdout = id => createAPIAction(GET_STDOUT, `/commands/${ id }/stdout`, { context: { id } });

// load the stderr response from the api
export const loadStderr = id => createAPIAction(GET_STDERR, `/commands/${ id }/stderr`, { context: { id } });

function randomId() {
    return String(Math.random()).substr(2);
}
