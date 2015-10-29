import { shell } from './index.css';

import React, { Component } from 'react';

export default class extends Component {
    render() {
        return (
            <div className={ shell }>
                <form>
                    <input type="text" />
                    <input className="button-primary" type="submit" value="submit" />
                </form>
            </div>
        );
    }
}
