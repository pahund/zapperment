const { trainNetwork } = require("./train");
const { loadTrack, buildRandomScene } = require("../track");
const { track, sceneQuality, maxAttempts } = require("../config");
const { Normalizer } = require("./normalize");

module.exports = class {
  /* ----- PRIVATE FIELDS ----- */

  #storage = null;
  #trainedNet = null;
  #track = null;
  #normalizer = null;

  /* ----- CONSTRUCTOR ----- */

  constructor({ storage }) {
    this.#storage = storage;
    this.#trainedNet = null;
    this.#track = null;
    this.#normalizer = null;
  }

  /* ----- PUBLIC METHODS ----- */

  async init() {
    this.#track = loadTrack(track);
    const {
      meta: { title, copyright }
    } = this.#track;
    console.log(
      `Track loaded: “${title}”${copyright ? ` – ${copyright}` : ""}`
    );
    const docs = await this.#storage.loadLoops();
    if (docs.length) {
      this.#normalizer = new Normalizer(docs);
      this.#trainedNet = trainNetwork(this.#normalizer.createTrainingData());
    }
  }

  buildRandomScene() {
    if (!this.#track) {
      throw new Error("You need to call init before building a scene");
    }
    return buildRandomScene(this.#track);
  }

  buildNewScene() {
    if (!this.#track) {
      throw new Error("You need to call init before building a scene");
    }
    if (!this.#trainedNet) {
      return this.buildRandomScene();
    }

    let scene;
    let commands;
    let output;
    let attempts = 0;

    do {
      ({ scene, commands } = buildRandomScene(this.#track));
      output = this.#trainedNet(this.#normalizer.normalizeScene(scene));
    } while (
      ++attempts < maxAttempts &&
      output.claps - output.boos < sceneQuality
    );

    const { claps, boos } = this.#normalizer.denormalizeStats(output);
    const prettyClaps = claps.toFixed(0);
    const prettyBoos = boos.toFixed(0);

    console.log(
      `NEW SCENE PREDICTION:\n${prettyClaps} clap${
        prettyClaps === "1" ? "" : "s"
      }, ${prettyBoos} boo${prettyBoos === "1" ? "" : "s"} (${attempts} attempt${
        attempts === 1 ? "" : "s"
      })`
    );
    return { scene, commands };
  }
};
