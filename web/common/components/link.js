import React from 'react';
import { Link as OldLink } from 'react-router';

export default function Link(props) {
    return <OldLink { ...props } />;
}
