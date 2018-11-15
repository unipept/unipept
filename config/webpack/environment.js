const {environment} = require("@rails/webpacker");

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

environment.loaders.append("vue", vue);
environment.loaders.append('typescript', typescript);
module.exports = environment;
