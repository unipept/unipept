const {environment} = require("@rails/webpacker");

const webpack = require("webpack");
const vue = require("./loaders/vue");

environment.plugins.append(
    "CommonsChunkVendor",
    new webpack.optimize.CommonsChunkPlugin({
        name: "commons",
        minChunks: 2,
    })
);

environment.loaders.append("vue", vue);
module.exports = environment;
