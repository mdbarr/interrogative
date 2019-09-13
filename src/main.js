import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from '@/plugins/vuetify';

import interrogative from '@/plugins/interrogative';

Vue.use(interrogative);

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: h => { return h(App); }
}).$mount('#app');
