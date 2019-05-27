module.exports = {
    optimization: {
      splitChunks: {
        // include all types of chunks
        chunks: 'all'
      }
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        }
    }
};
