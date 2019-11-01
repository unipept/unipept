module.exports = {
    test: /\.(ts|tsx)?(\.erb)?$/,
    use: [{
        loader: 'ts-loader',
        options: {
            appendTsSuffixTo: [/\.vue$/],
            allowTsInNodeModules: true
        }
    }]
};
