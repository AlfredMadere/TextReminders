import React, { Component } from "react";
import "./App.css";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import SessionLogger from "../SessionLogger/SessionLogger";

class App extends Component {
  render() {
    return (
      <div className="wrapper">
        <h1>Form Type</h1>
        <BrowserRouter>
          <Switch>
            <Route exact path="/logger/:id" component={SessionLogger} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
