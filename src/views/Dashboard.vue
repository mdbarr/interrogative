<template>
<div>
  <v-navigation-drawer expand-on-hover permanent app clipped mini-variant-width="54" width="240">
    <v-tabs vertical dark slider-color="white" slider-size="2" v-model="sideTab">
      <v-tab class="white--text">
        <v-icon left class="pl-2 pr-2">mdi-monitor-dashboard</v-icon> Dashboard
      </v-tab>
      <v-divider></v-divider>
      <v-tab class="white--text">
        <v-icon left class="pl-2 pr-2">mdi-calendar-plus</v-icon> Schedule an Interview
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
    <v-menu offset-y left>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" class="elevation-0">
          <span class="text-uppercase subtitle-2 pr-2">
            {{ state.session.user.name }}
          </span>
          <v-icon right>mdi-account-circle</v-icon>
        </v-btn>
      </template>

      <v-list dense class="pa-0">
        <v-list-item dense class="body-2 ma-0" @click="signout">
          SIGN OUT<v-spacer />
          <v-icon right>mdi-logout-variant</v-icon>
        </v-list-item>
      </v-list>
    </v-menu>
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
                <InterviewList
                  title="Current & Upcoming Interviews"
                  :upcoming="true"
                  :limit="3"
                  @more="sideTab = 2"
                  />
                <InterviewList
                  title="Past Interviews"
                  :upcoming="false"
                  :limit="3"
                  @more="sideTab = 3"
                  />
              </v-container>
            </v-tab-item>
            <v-tab-item class="tab-content">
              <InterviewTemplate @done="sideTab = 0"/>
            </v-tab-item>

            <v-tab-item class="tab-content">
              <InterviewList heading="All Current & Upcoming Interviews" icon="mdi-calendar-account" :upcoming="true" />
            </v-tab-item>

            <v-tab-item class="tab-content">
              <InterviewList heading="All Past Interviews" icon="mdi-calendar-clock" :upcoming="false" />
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
import InterviewList from '../components/InterviewList';
import InterviewTemplate from '../components/InterviewTemplate';
import Notifications from '../components/Notifications';

export default {
  name: 'dashboard',
  components: {
    InterviewList,
    InterviewTemplate,
    Notifications
  },
  data () {
    return {
      state,
      sideTab: null
    };
  },
  methods: { signout () {
    this.$api.delete('/session').
      then(() => {
        this.$session(false);
      });
  } },
  mounted () {}
};
</script>

<style>
.drawer {
    overflow: hidden;
    width: 300px;
}
.v-tabs {
    overflow: hidden;
    width: 300px;
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
