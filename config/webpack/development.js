const environment = require("./environment");

const config = environment.toWebpackConfig();
config.devtool = "source-map";

module.exports = config;
