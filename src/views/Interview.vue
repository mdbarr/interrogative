<template>
<div id="interview">
  <div v-if="!state.ready">
    <v-overlay>
      <v-progress-circular indeterminate size="200" width="3" color="white"></v-progress-circular>
    </v-overlay>
  </div>
  <div v-else>
    <v-navigation-drawer permanent :mini-variant.sync="mini" mini-variant-width="45" width="345" app clipped>
      <v-tabs vertical dark slider-color="white" slider-size="2">
        <v-tab class="white--text">
          <v-icon left>mdi-account-multiple</v-icon>
        </v-tab>
        <v-tab class="white--text">
          <v-icon left>mdi-folder</v-icon>
        </v-tab>
        <v-tab class="white--text">
          <v-icon left>mdi-file-search</v-icon>
        </v-tab>
        <v-tab class="white--text" v-if="state.interview.git">
          <v-icon left>mdi-source-branch</v-icon>
        </v-tab>
        <v-tab class="white--text">
          <v-icon left>mdi-note</v-icon>
        </v-tab>
        <v-tab class="white--text">
          <v-icon left>mdi-settings</v-icon>
        </v-tab>

        <v-tab-item v-if="!mini">
          <v-card flat>
            <v-card-text class="white--text">
              Interview
            </v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item v-if="!mini">
          <v-card flat class="ma-0 pa-0">
            <v-card-text class="white--text ma-1 pa-0">
              <FileTree></FileTree>
            </v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item v-if="!mini">
          <v-card flat>
            <v-card-text class="white--text">
              Search
            </v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item v-if="!mini && state.interview.git">
          <v-card flat>
            <v-card-text class="white--text">
              <Git></Git>
            </v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item v-if="!mini">
          <v-card flat>
            <v-card-text class="white--text">
              Notes
            </v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item v-if="!mini">
          <v-card flat>
            <v-card-text class="white--text">
              <Settings></Settings>
            </v-card-text>
          </v-card>
        </v-tab-item>

      </v-tabs>
    </v-navigation-drawer>

    <v-app-bar app color="#222" dark clipped-left dense fixed height="40" class="title">
      <v-btn dense small tile icon @click.stop="mini = !mini"><v-icon>mdi-comment-multiple</v-icon></v-btn>
      <v-toolbar-title class="pl-2 title">Interrogative</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-icon v-if="state.name" class="pr-2">mdi-account-circle</v-icon>
      <span class="text-uppercase subtitle-2 pr-2">
        {{ state.name }}
      </span>
    </v-app-bar>

    <v-content color="#222">
      <v-container fluid fill-height class="ma-0 pl-0 main-area">
        <v-layout wrap>
          <v-flex xs12>
            <v-card class="ma-0" flat tile>
              <FileTabs></FileTabs>
              <Editor></Editor>
            </v-card>
          </v-flex>
          <v-flex xs12>
            <v-card class="ma-0" flat tile>
              <v-tabs show-arrows v-model="terminalTab" color="white" height="30" slider-color="white">
                <v-btn dense small tile icon left height="30" class="plus-button">
                  <v-icon small>mdi-plus</v-icon>
                </v-btn>
                <v-tab v-for="item of terminalTabs" :key="item.name" class="tab-bg pl-2 pr-2">
                  <v-icon v-if="item.icon" small class="pr-2">mdi-{{ item.icon }}</v-icon>
                  <span class="pr-1">{{ item.name }}</span>
                  <v-icon v-if="item.closeable" small class="pl-2">mdi-close</v-icon>
                </v-tab>
              </v-tabs>
              <Terminal></Terminal>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer color="#333" app dark height="24" class="subtitle-2 pa-0 ma-0">
    <span class="pl-2">&copy; 2019</span>
  </v-footer>

  <v-snackbar v-model="snackbar" top color="success">
    {{ snackbarMessage }}
    <v-btn icon @click="snackbar = false"><v-icon>mdi-close</v-icon></v-btn>
  </v-snackbar>
  </div>
</div>
</template>

<script>
import Editor from '../components/Editor';
import FileTabs from '../components/FileTabs';
import FileTree from '../components/FileTree';
import Git from '../components/Git';
import Settings from '../components/Settings';
import Terminal from '../components/Terminal';
import state from '../state';

export default {
  name: 'interview',
  components: {
    Editor,
    FileTabs,
    FileTree,
    Git,
    Settings,
    Terminal
  },
  data: () => {
    return {
      state,
      mini: true,
      socket: null,
      terminalTab: 0,
      terminalTabs: [ {
        name: 'Terminal',
        type: 'terminal',
        icon: 'console',
        closeable: false
      }, {
        name: 'Messages',
        type: 'message',
        icon: 'forum',
        closeable: false
      } ],
      snackbar: false,
      snackbarMessage: ''
    };
  },
  methods: { },
  mounted () {
    this.state.id = this.$route.params.id;

    this.$api.get(`/interview/${ this.state.id }/ready`).
      then((interview) => {
        Object.assign(this.state.interview, interview);
        this.connection = this.$connect(this.state.id);
        this.state.ready = true;
      });

    this.$events.on('connected', (event) => {
      if (event.data.user !== this.state.user) {
        this.snackbarMessage = `${ event.data.name } joined`;
        this.snackbar = true;
      }
    });
  },
  destroyed () { }
};
</script>

<style>
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
.tab-spacer {
    zzzborder-right: 4px solid #303030;
}

.tab-bg.v-tab--active {
    background-color: inherit;
    zzzborder-right: 2px solid #595959;
    color: white !important;
    opacity: 1 !important;
    zzzborder-left: 1px solid white;
    zzzborder-right: 1px solid white;
}
.tab-bg-color {
    position: relative;
    background-color: #303030;
    max-width: none !important;
    opacity: 1 !important;
}
.main-area {
    padding-top: 0px !important;
    padding-bottom: 0px !important;
    padding-right: 0px !important;
}
.plus-button {
    border-right: 1px solid #595959;
}
</style>
