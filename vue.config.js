const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: process.env.GH_ACTION === 'true' ? '/unipept-web/' : '/'
})
