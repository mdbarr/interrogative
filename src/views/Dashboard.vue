<template>
<div>
  <v-navigation-drawer permanent :mini-variant.sync="mini" app clipped mini-variant-width="50" width="345">
    <v-tabs vertical dark slider-color="white" slider-size="2" optional @change="sideTabChange" v-model="sideTab">
      <v-tab class="white--text">
        <v-icon left>mdi-monitor-dashboard</v-icon>
      </v-tab>
      <v-tab class="white--text">
        <v-icon left>mdi-calendar-plus</v-icon>
      </v-tab>
      <v-tab class="white--text">
        <v-icon left>mdi-calendar-account</v-icon>
      </v-tab>
      <v-tab class="white--text">
        <v-icon left>mdi-calendar-clock</v-icon>
      </v-tab>
      <v-tab class="white--text">
        <v-icon left>mdi-settings</v-icon>
      </v-tab>
    </v-tabs>
    <div></div>
  </v-navigation-drawer>
  <v-app-bar app color="#222" dark clipped-left dense fixed height="40" class="title">
    <v-btn dense small tile icon @click.stop="mini = !mini" class="pl-3">
      <img src="../assets/logo.svg" width="30" class="app-bar-logo">
    </v-btn>
    <v-toolbar-title class="pl-4 app-bar-title">INTERROGATIVE.IO</v-toolbar-title>
    <v-spacer></v-spacer>
    <span class="text-uppercase subtitle-2 pr-2">
      {{ state.session.user.name }}
    </span>
    <v-icon class="pr-1">mdi-account-circle</v-icon>
  </v-app-bar>

  <v-content color="#222">
    <v-container fluid fill-height class="ma-0 pl-0 main-area">
      <v-layout wrap>
        <v-flex xs12>

        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
  <v-footer color="#333" app dark height="24" class="subtitle-2 pa-0 ma-0">
    <span class="pl-2">&copy; 2019</span>
  </v-footer>
  <Notifications></Notifications>
</div>
</template>

<script>
import state from '../state';
import Notifications from '../components/Notifications';

export default {
  name: 'dashboard',
  components: { Notifications },
  data () {
    return {
      state,
      mini: true,
      sideTab: null
    };
  },
  methods: { sideTabChange (value) {
    if (value === undefined) {
      this.mini = true;
    }
  } },
  mounted () {}
};
</script>

<style>
.drawer {
    overflow: hidden;
}
.v-tab {
    min-width: 48px !important;
    padding-left: 6px !important;
    padding-right: 0px !important;
}
.tab-bg {
    color: white !important;
    text-transform: none !important;
    background-color: #303030;
}
.tab-bg.v-tab--active {
    background-color: inherit;
    color: white !important;
    opacity: 1 !important;
}
.tab-bg-color {
    position: relative;
    background-color: #303030;
    max-width: none !important;
    opacity: 1 !important;
}
</style>
