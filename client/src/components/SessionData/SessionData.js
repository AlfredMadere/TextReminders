import React, { Component } from 'react';

class SessionData extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div>
          <ul>
              <li>Student: {this.props.sessionData.student}</li>
              <li>Tutor: {this.props.sessionData.tutor}</li>
              <li>Subject: {this.props.sessionData.subject}</li>
              <li>Time: {this.props.sessionData.startTime}</li>
              <li>Length: {this.props.sessionData.duration}</li>
              <li>Date: {this.props.sessionData.date}</li>
            </ul>
      </div>
     
    )

  }
    
}


  
  
  export default SessionData;