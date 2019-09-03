import React, { Component } from "react";
import io from "socket.io-client";
import Lamp from "./Lamp";
import ClapButton from "./ClapButton";
import PlayButton from "./PlayButton";
import Emoji from "./Emoji";
import styles from "./App.module.css";
import BooButton from "./BooButton";

const { protocol, hostname } = window.location;
const serverUrl = `${protocol}//${hostname}:3001`;
const socket = io(serverUrl);


class App extends Component {
  state = { claps: 0, boos: 0 };

  handleClaps = claps => {
    this.setState({ claps });
  };

  handleBoos = boos => {
    this.setState({ boos });
  };

  render() {
    const { claps, boos } = this.state;
    return (
      <div className={styles.component}>
        <div className="claps">
          {[...new Array(claps)].map((e, i) => (
            <Emoji key={i} icon={"👏"} />
          ))}
        </div>

        <div className="boos">
          {[...new Array(boos)].map((e, i) => (
            <Emoji key={i} icon={"💩"} />
          ))}
        </div>

        <div className={styles.logo}>
          <img src="./zapperment-logo.png" alt="" />
        </div>
        <Lamp socket={socket} />
        <div className={styles.actions}>
          <ClapButton socket={socket} onClaps={this.handleClaps} />
          <BooButton socket={socket} onBoos={this.handleBoos} />
          <PlayButton socket={socket} />
        </div>
      </div>
    );
  }
}

export default App;
