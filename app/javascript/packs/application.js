/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

import jQuery from 'jquery'
import d3 from 'd3'
import dragula from 'dragula'

// the path prefix can be removed in the next version of the webpacker gem
// by adding "resolved_paths: ['app/assets']" to "config/webpacker.yml"
import '../../assets/javascripts/polyfills.js'

// add jquery aliases
window.jQuery = jQuery;
window.jquery = jQuery;
window.$ = jQuery;

window.dragula = dragula;
