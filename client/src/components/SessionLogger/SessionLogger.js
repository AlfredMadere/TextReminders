import React, { Component } from "react";
import SessionLogForm from "../SessionLogForm/SessionLogForm";
import MissingSession from "../MissingSession/MissingSession";
import SessionEditForm from "../SessionEditForm/SessionEditForm";

class SessionLogger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionData: [],
      notes: "please include session notes",
      status: "",
    };
  }

  async componentDidMount() {
    try {
      console.log("john mounted");
      const id = this.props.match.params.id;
      const res = await fetch(`/logger/?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        await this.setState({ sessionData: data, status: data.status });
      } else {
        throw Error(res.statusText);
      }
    } catch (err) {
      this.setState({ status: "not found" });
      console.log(err);
    }
  }

  render() {
    //If the status of the session is "occured", render LogForm. If status is "logged" render EditForm. Otherwise render MissingSession
    return (
      <div>
        {this.state.status === "unlogged" ? (
          <SessionLogForm sessionData={this.state.sessionData} />
        ) : this.state.status === "logged" ? (
          <SessionEditForm sessionData={this.state.sessionData} />
        ) : (
          <MissingSession />
        )}
      </div>
    );
  }
}

export default SessionLogger;
