import { createAPIAction } from 'web/common/redux';

export const POST_COMMAND = 'post_command';
export const GET_COMMANDS = 'get_commands';
export const GET_COMMAND = 'get_command';
export const GET_STDOUT = 'get_stdout';
export const GET_STDERR = 'get_stderr';

export function getHistory() {
    return createAPIAction({ type: GET_COMMANDS, path: `/commands` });
}

export function getCommand(id) {
    return createAPIAction({ type: GET_COMMAND, path: `/commands/${ id }`, id });
}

export function runCommand(args) {
    const cid = randomId();
    args = ['sh', '-c', args];

    const body = JSON.stringify({ args });

    return createAPIAction({
        type: POST_COMMAND, 
        method: 'post',
        path: `/commands`,
        options: { body },
        args,
        cid,
    });
}

export function getStdout(id) {
    return createAPIAction({ type: GET_STDOUT, path: `/commands/${ id }/stdout`, id });
}

export function getStderr(id) {
    return createAPIAction({ type: GET_STDERR, path: `/commands/${ id }/stderr`, id });
}

function randomId() {
    return String(Math.random()).substr(2);
}
