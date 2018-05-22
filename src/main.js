// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import { Vuetify, VCard, VFooter, VGrid, VIcon, VSelect, Vapp, VTabs, VPagination, VProgressCircular } from 'vuetify';
require('vuetify/src/stylus/app.styl');
Vue.config.productionTip = false;

Vue.use(Vuetify, { components: { VCard, VFooter, VGrid, VIcon, VSelect, Vapp, VTabs, VPagination, VProgressCircular } });

/* eslint-disable no-new */
var vue = new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
});
