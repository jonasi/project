/* eslint no-console:0 */

export const DEBUG = 'debug';
export const INFO = 'info';
export const WARN = 'warn';
export const ERROR = 'error';

const consoleLog = (...args) => console.log(...args);
const consoleWarn = (...args) => console.warn(...args);
const consoleErr = (...args) => console.error(...args);

export default class Logger {
    constructor() {
        this._children = {};
        this._tags = {};
        this._parent = null;
    }

    child(name) {
        if (!this._children[name]) {
            this._children[name] = new Logger();
            this._children[name].tag('name', name);

            this._parent = this;
        }

        return this._children[name];
    }

    tags() {
        const t = this._parent ? this._parent.tags() : [];
        t.push(this._tags);

        return t;
    }

    tag(key, value) {
        this._tags[key] = value;
        return this;
    }

    debug(...args) {
        return this._log(consoleLog, DEBUG, ...args);
    }

    info(...args) {
        return this._log(consoleLog, INFO, ...args);
    }

    warn(...args) {
        return this._log(consoleWarn, WARN, ...args);
    }

    error(...args) {
        return this._log(consoleErr, ERROR, ...args);
    }

    _log(handler, level, ...args) {
        handler("[" + level + "]", ...this.tags(), ...args);
        return this;
    }
}
