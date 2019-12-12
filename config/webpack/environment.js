const {environment} = require("@rails/webpacker");
const resolveConfig = require("./resolves");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

const webpack = require("webpack");
const vue = require("./loaders/vue");
const typescript = require("./loaders/typescript");
const css = require("./loaders/css");
const less = require("./loaders/less");
const sass = require("./loaders/sass");
const workerLoader = require("./loaders/worker-loader");
const docLoader = require("./loaders/doc-loader");
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

const WebpackAssetsManifest = require("webpack-assets-manifest");

// Enable the default config
// environment.splitChunks();

environment.config.merge(resolveConfig);

// Compile TypeScript and Vue
environment.loaders.append("worker-loader", workerLoader);
environment.loaders.append("null-loader", docLoader);
environment.loaders.append("vue", vue);
environment.loaders.append("typescript", typescript);

// Compile less and css
environment.loaders.append("css", css);
environment.loaders.append("less", less);
environment.loaders.append("sass", sass);

// This plugin is required by the Vue-loader
environment.plugins.prepend("VueLoaderPlugin", new VueLoaderPlugin());
environment.plugins.prepend("VuetifyLoader", new VuetifyLoaderPlugin());


// The unipept-web-components library contains some requires for electron, which are only required when it's being used
// in an electron-environment. We can thus safely ignore these here.
environment.plugins.prepend("IgnorePlugin", new webpack.IgnorePlugin({
    resourceRegExp: /^(electron|fs)/,
    contextRegExp: /.*/ 
}));
module.exports = environment;
