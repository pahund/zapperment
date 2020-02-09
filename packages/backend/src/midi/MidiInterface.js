const { openMidiOut } = require("./utils");

module.exports = class {
  #midiOut = null;

  constructor({ midiPortName }) {
    try {
      this.#midiOut = openMidiOut(midiPortName);
    } catch (error) {
      this.#fatalError(error);
    }
  }

  sendStop() {
    this.#midiOut.sendMessage([0xfc]);
  }

  sendStart() {
    this.#midiOut.sendMessage([0xfa]);
  }

  sendClock() {
    this.#midiOut.sendMessage([0xf8]);
  }

  sendControl(channel, controller, value) {
    this.#midiOut.sendMessage([0xb0 + channel, controller, value]);
  }

  sendNoteOn(channel, note, velocity) {
    this.#midiOut.sendMessage([0x90 + channel, note, velocity]);
  }

  sendNoteOff(channel, note, velocity) {
    this.#midiOut.sendMessage([0x80 + channel, note, velocity]);
  }

  #fatalError = error => {
    console.error(`Fatal error in MIDI interface module: ${error.message}`);
    process.exit(1);
  };
};
