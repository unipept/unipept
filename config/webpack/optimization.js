const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: false, // Must be set to true if using source-maps in production
                terserOptions: {}
            }),
        ],
        nodeEnv: "production"
    }
}
