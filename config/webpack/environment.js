const {environment} = require("@rails/webpacker");
const resolveConfig = require("./resolves");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

const webpack = require("webpack");
const vue = require("./loaders/vue");
const typescript = require("./loaders/typescript");
const css = require("./loaders/css");
const less = require("./loaders/less");
const workerLoader = require("./loaders/worker-loader");

const WebpackAssetsManifest = require("webpack-assets-manifest");

// Enable the default config
// environment.splitChunks();

environment.config.merge(resolveConfig);

environment.loaders.append("typescript", typescript);
environment.loaders.append("css", css);
environment.loaders.append("less", less);
environment.plugins.prepend("VueLoaderPlugin", new VueLoaderPlugin());
environment.loaders.prepend("vue", vue);
environment.loaders.prepend("worker-loader", workerLoader);
// The unipept-web-components library contains some requires for electron, which are only required when it's being used
// in an electron-environment. We can thus safely ignore these here.
environment.plugins.prepend("IgnorePlugin", new webpack.IgnorePlugin({
    resourceRegExp: /^(electron|fs)/,
    contextRegExp: /.*/ 
}));
module.exports = environment;
