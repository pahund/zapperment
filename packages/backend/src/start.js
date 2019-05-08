const db = require("./db");
const http = require("http");
const express = require("express");
const socket = require("./socket");
const path = require("path");
const audio = require("osx-audio");
const lame = require("lame");
const audioInput = new audio.Input();
const { Worker } = require("worker_threads");
const { START_PLAYING, STOP_PLAYING } = require("./constants");
const { BEAT, NEW_SCENE, STATS_RESET_CLAP } = require("@zapperment/shared");
const { initialTempo, barsPerLoop, port } = require("./config");
const { updateScene } = require("./loop");

let midiBeat = null;

process.on("SIGTERM", stop);
process.on("SIGINT", stop);

const encoder = new lame.Encoder({
  // input
  channels: 2, // 2 channels (left and right)
  bitDepth: 16, // 16-bit samples
  sampleRate: 44100, // 44,100 Hz sample rate

  // output
  bitRate: 128,
  outSampleRate: 22050,
  mode: lame.STEREO
});
audioInput.pipe(encoder);

module.exports = () => {
  const app = express();
  const server = http.Server(app);
  const io = socket.configure(server);

  app.get("/stream.mp3", (req, res) => {
    res.set({
      "Content-Type": "audio/mpeg3",
      "Transfer-Encoding": "chunked"
    });
    encoder.pipe(res);
  });

  midiBeat = new Worker(path.join(__dirname, "./midiBeatWorker.js"), {
    workerData: { tempo: initialTempo, barsPerLoop }
  });

  midiBeat.on("message", message => {
    switch (message.type) {
      case BEAT:
        io.emit(BEAT, { for: "everyone" });
        break;
      case NEW_SCENE:
        updateScene(message.data);
        io.emit(STATS_RESET_CLAP, { for: "everyone" });
        break;
      default:
    }
  });

  db.init(err => {
    if (err) {
      throw err;
    }
    midiBeat.postMessage(START_PLAYING);
    server.listen(port);
  });
};

function stop() {
  midiBeat.postMessage(STOP_PLAYING);
  process.exit(0);
}
