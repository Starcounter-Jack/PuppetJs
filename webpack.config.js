const webpack = require("webpack");
const version = require('./package.json').version;

module.exports = [
  {
    entry: "./src/palindrom.js",
    output: {
      filename: "palindrom.js",
      library: "Palindrom",
      libraryTarget: "var"
    },
    mode: 'development',
    resolve: {
      extensions: [".js"]
    },
    /* (see: https://webpack.js.org/configuration/externals/) */
    externals: { websocket: "WebSocket", './URL': 'URL' },
    plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]    
  },
  {
    entry: "./src/palindrom.js",
    output: {
      filename: "palindrom.min.js",
      library: "Palindrom",
      libraryTarget: "var"
    },
    mode: 'production',
    resolve: {
      extensions: [".js"]
    },
    externals: { websocket: "WebSocket", './URL': 'URL' },
    plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
  },
  {
    entry: "./src/palindrom-dom.js",
    output: {
      filename: "palindrom-dom.js",
      library: "PalindromDOM",
      libraryTarget: "var"
    },
    resolve: {
      extensions: [".js"]
    },
    mode: 'development',
    externals: { websocket: "WebSocket", './URL': 'URL' },
    plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
  },
  {
    entry: "./src/palindrom-dom.js",
    output: {
      filename: "palindrom-dom.min.js",
      library: "PalindromDOM",
      libraryTarget: "var"
    },
    mode: 'production',
    resolve: {
      extensions: [".js"]
    },
    externals: { websocket: "WebSocket", './URL': 'URL' },
    plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
  },
  /* bundle tests for browser */
  {
    entry: "./test/runner.js",
    output: {
      filename: "../test/runner-browser.js",
      library: "Tests",
      libraryTarget: "var"
    },
    mode: 'development',
    externals: { websocket: "WebSocket", './URL': 'URL' },
    resolve: {
      extensions: [".js"]
    }
  },
  /* bundle tests for node */
  {
    entry: "./test/runner.js",
    output: {
      filename: "../test/runner-node.js",
      library: "Tests",
      libraryTarget: "commonjs"
    },
    mode: 'development',
    resolve: {
      extensions: [".js"]
    }
  }
];
