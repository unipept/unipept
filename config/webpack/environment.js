const {environment} = require("@rails/webpacker");
const resolveConfig = require("./resolves");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

const webpack = require("webpack");
const vue = require("./loaders/vue");
const typescript = require("./loaders/typescript");
const css = require("./loaders/css");

const WebpackAssetsManifest = require("webpack-assets-manifest");

// Enable the default config
// environment.splitChunks();

environment.config.merge(resolveConfig);

environment.loaders.append("typescript", typescript);
environment.loaders.append("css", css);
environment.plugins.prepend("VueLoaderPlugin", new VueLoaderPlugin());
environment.loaders.prepend("vue", vue);
module.exports = environment;
