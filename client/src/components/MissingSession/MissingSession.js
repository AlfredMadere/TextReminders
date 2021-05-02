import React, { Component } from 'react';

class MissingSession extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div>
                <h1>Something has gone seriously wrong.</h1>
                <h3>Alfred might get a text about this and youp might get fired</h3>
            </div>
        )
    }
}

export default MissingSession;