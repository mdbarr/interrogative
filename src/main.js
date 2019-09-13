import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from '@/plugins/vuetify';

import interrogative from '@/plugins/interrogative';

import moment from 'moment';
Vue.use(interrogative);

Vue.config.productionTip = false;

Vue.filter('calendar', (value = Date.now()) => {
  return moment(value).calendar();
});

Vue.filter('plural', (word, array) => {
  if (array.length !== 1) {
    return `${ word }s`;
  }
  return word;
});

const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
Vue.filter('formatBytes', (bytes) => {
  bytes = Number(bytes) || 0;
  if (bytes === 0) {
    return '0 Bytes';
  }
  const kilobyte = 1024;
  const places = 2;

  const index = Math.floor(Math.log(bytes) / Math.log(kilobyte));
  return `${ parseFloat((bytes / Math.pow(kilobyte, index)).toFixed(places)) } ${ sizes[index] }`;
});

const numbers = [ 'zero', 'one', 'two', 'three', 'four',
  'five', 'six', 'seven', 'eight', 'nine', 'ten' ];
Vue.filter('number', (value) => {
  if (numbers[value]) {
    return numbers[value];
  }
  return value.toString();
});

new Vue({
  router,
  vuetify,
  render: h => { return h(App); }
}).$mount('#app');
