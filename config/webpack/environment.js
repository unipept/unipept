const {environment} = require("@rails/webpacker");
const resolveConfig = require('./resolves');

const webpack = require("webpack");
const vue = require("./loaders/vue");
const typescript = require("./loaders/typescript");

environment.plugins.append(
    "CommonsChunkVendor",
    new webpack.optimize.CommonsChunkPlugin({
        name: "commons",
        minChunks: 2,
    })
);

environment.config.merge(resolveConfig);

environment.loaders.append("vue", vue);
environment.loaders.append('typescript', typescript);
module.exports = environment;
