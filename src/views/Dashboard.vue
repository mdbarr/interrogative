<template>
<div>
  <v-navigation-drawer permanent :mini-variant.sync="mini" app clipped mini-variant-width="50">
    <v-list dense class="drawer">
      <v-list-item @click="() => {}" class="subtitle-2 drawer pt-2 pb-2">
        <v-list-item-icon>
          <v-icon>mdi-monitor-dashboard</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="() => {}" class="subtitle-2 drawer pt-2 pb-2">
        <v-list-item-icon>
          <v-icon>mdi-calendar-account</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Upcoming Interviews</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="() => {}" class="subtitle-2 drawer pt-2 pb-2">
        <v-list-item-icon>
          <v-icon>mdi-calendar-clock</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Past Interviews</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="() => {}" class="subtitle-2 drawer pt-2 pb-2">
        <v-list-item-icon>
          <v-icon>mdi-calendar-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Schedule new Interview</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="() => {}" class="subtitle-2 drawer pt-2 pb-2">
        <v-list-item-icon>
          <v-icon>mdi-settings</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
     </v-list>
  </v-navigation-drawer>
  <v-app-bar app color="#222" dark clipped-left dense fixed height="40" class="title">
    <v-btn dense small tile icon @click.stop="mini = !mini" class="pl-3">
      <img src="../assets/logo.svg" width="30" class="app-bar-logo">
    </v-btn>
    <v-toolbar-title class="pl-4 app-bar-title">INTERROGATIVE.IO</v-toolbar-title>
    <v-spacer></v-spacer>
    <span class="text-uppercase subtitle-2 pr-2">
      {{ state.name }}
    </span>
    <v-icon v-if="state.name" class="pr-1">mdi-account-circle</v-icon>
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
      mini: true
    };
  }
};
</script>

<style>
.drawer {
    overflow: hidden;
}
</style>
