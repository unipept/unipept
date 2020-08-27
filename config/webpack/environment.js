const { environment } = require('@rails/webpacker');
const typescript =  require('./loaders/typescript');
const less = require('./loaders/less');
const sass = require('./loaders/sass');
const css = require('./loaders/css');
const { VueLoaderPlugin } = require('vue-loader');
const vue = require('./loaders/vue');
const doc = require('./loaders/doc-loader');
const workerLoader = require('./loaders/worker-loader');
const resolveConfig = require("./resolves");
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

const webpack = require("webpack");

environment.config.merge(resolveConfig);

environment.plugins.prepend("VuetifyLoader", new VuetifyLoaderPlugin());
environment.plugins.prepend('VueLoaderPlugin', new VueLoaderPlugin());

environment.loaders.prepend('vue', vue);
environment.loaders.prepend('typescript', typescript);
environment.loaders.prepend("less", less);
environment.loaders.prepend("sass", sass);
// environment.loaders.prepend("css", css);
environment.loaders.prepend("worker-loader", workerLoader);
environment.loaders.prepend("doc-loader", doc);

// The unipept-web-components library contains some requires for electron, which are only required when it's being used
// in an electron-environment. We can thus safely ignore these here.
environment.plugins.prepend("IgnorePlugin", new webpack.IgnorePlugin({
    resourceRegExp: /^(electron|fs)/,
    contextRegExp: /.*/
}));

module.exports = environment;
