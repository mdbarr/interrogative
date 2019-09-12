<template>
<div>
  <v-navigation-drawer permanent expand-on-hover app clipped mini-variant-width="54" width="265">
    <v-tabs vertical dark slider-color="white" slider-size="2" v-model="sideTab">
      <v-tab class="white--text">
        <v-icon left class="pl-2 pr-2">mdi-monitor-dashboard</v-icon> Dashboard
      </v-tab>
      <v-divider></v-divider>
      <v-tab class="white--text">
        <v-icon left class="pl-2 pr-2">mdi-calendar-plus</v-icon> Schedule a new Interview
      </v-tab>
      <v-tab class="white--text">
        <v-icon left class="pl-2 pr-2">mdi-calendar-account</v-icon> Upcoming Interviews
      </v-tab>
      <v-tab class="white--text">
        <v-icon left class="pl-2 pr-2">mdi-calendar-clock</v-icon> Past Interviews
      </v-tab>
      <v-divider></v-divider>
      <v-tab class="white--text">
        <v-icon left class="pl-2 pr-2">mdi-account-card-details</v-icon> Account
      </v-tab>
      <v-tab class="white--text">
        <v-icon left class="pl-2 pr-2">mdi-settings</v-icon> Settings
      </v-tab>
    </v-tabs>
    <div></div>
  </v-navigation-drawer>
  <v-app-bar app color="#222" dark clipped-left dense fixed height="40" class="title">
    <img src="../assets/logo.svg" width="30" height="30">
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
        <v-flex xs12 class="ma-2">
          <v-tabs-items v-model="sideTab">
            <v-tab-item class="tab-content">
              <v-container fluid class="pt-0">
                <v-row dense>
                  <v-col md="6" class="font-weight-bold text-uppercase pl-5">
                    <v-icon left class="pr-2">mdi-monitor-dashboard</v-icon>Dashboard
                  </v-col>
                </v-row>
                <Upcoming />
              </v-container>
            </v-tab-item>
            <v-tab-item class="tab-content">
              <InterviewTemplate />
            </v-tab-item>
          </v-tabs-items>
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
import InterviewTemplate from '../components/InterviewTemplate';
import Notifications from '../components/Notifications';
import Upcoming from '../components/Upcoming';

export default {
  name: 'dashboard',
  components: {
    InterviewTemplate,
    Notifications,
    Upcoming
  },
  data () {
    return {
      state,
      sideTab: null
    };
  },
  methods: {},
  mounted () {}
};
</script>

<style>
.drawer {
    overflow: hidden;
}
.v-tab {
    padding-left: 6px !important;
    padding-right: 20px !important;
    justify-content: left;
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
.tab-content {
    background-color: #303030;
}
</style>
