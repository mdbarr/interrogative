<template>
  <v-app id="app">
    <router-view />
    <Notifications />
  </v-app>
</template>

<script>
import state from './state';
import Notifications from './components/Notifications';

export default {
  name: 'App',
  components: { Notifications },
  data () {
    return { state };
  },
};
</script>

<style>
html {
  width: 100%;
  height: 100%;
  margin: 0;
  background-color: #303030;
}
</style>
