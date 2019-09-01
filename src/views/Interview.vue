<template>
<div id="interview">
  <div v-if="!state.ready">
    <v-overlay>
      <v-progress-circular indeterminate size="200" width="3" color="white"></v-progress-circular>
    </v-overlay>
  </div>
  <div v-else>
    <v-navigation-drawer permanent :mini-variant.sync="mini" mini-variant-width="45" width="345" app clipped>
      <v-tabs vertical dark slider-color="white" slider-size="2" optional @change="sideTabChange" v-model="sideTab">
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
        <v-tab class="white--text" v-if="state.interview.uploads">
          <v-icon left>mdi-cloud-upload</v-icon>
        </v-tab>
        <v-tab class="white--text">
          <v-icon left>mdi-settings</v-icon>
        </v-tab>

        <v-tab-item v-if="!mini">
          <v-card flat>
            <v-card-text class="white--text" v-if="state.interview.id">
              <div v-if="state.interview.title" class="section-heading">{{ state.interview.title }}</div>
              <div v-else class="section-heading">Interview</div>
              <div>
                <span class="font-weight-bold">{{ 'Candidate' | plural(userFilter('candidate')) }}</span>
                <v-icon class="float-right">mdi-comment-account</v-icon>
              </div>
              <div v-for="user of userFilter('candidate')" :key="user.id">
                 <v-tooltip bottom>
                   <template v-slot:activator="{ on }">
                     <v-icon v-on="on" v-if="state.online[user.id]" x-small color="green" class="pr-1" title="online">
                       mdi-circle
                     </v-icon>
                     <v-icon v-on="on" v-else x-small color="red" class="pr-1">mdi-checkbox-blank-circle-outline</v-icon>
                   </template>
                   <span v-if="state.online[user.id]">{{ user.name }} is online</span>
                   <span v-else>{{ user.name }} is not online</span>
                 </v-tooltip>
                {{ user.name }}
              </div>
              <div v-if="state.interview.position">
                <v-icon small class="pr-2">mdi-briefcase-outline</v-icon>
                {{ state.interview.position }}
              </div>
              <br>
              <br>
              <div>
                <span class="font-weight-bold">{{ 'Interviewer' | plural(userFilter('interviewer')) }}</span>
                <v-icon class="float-right">mdi-comment-account-outline mdi-flip-h</v-icon>
              </div>
              <br>
              <div v-for="user of userFilter('interviewer')" :key="user.id">
                 <v-tooltip bottom>
                   <template v-slot:activator="{ on }">
                     <v-icon v-on="on" v-if="state.online[user.id]" x-small color="green" class="pr-1" title="online">
                       mdi-circle
                     </v-icon>
                     <v-icon v-on="on" v-else x-small class="pr-1">mdi-checkbox-blank-circle-outline</v-icon>
                   </template>
                   <span v-if="state.online[user.id]">{{ user.name }} is online</span>
                   <span v-else>{{ user.name }} is not online</span>
                 </v-tooltip>
                 {{ user.name }}
              </div>
              <div v-if="state.interview.company">
                <v-icon small class="pr-2">mdi-office-building</v-icon>
                {{ state.interview.company }}
              </div>
              <br>
              <br>
              <div>
                <span class="font-weight-bold">When</span>
                <v-icon class="float-right">mdi-calendar-clock</v-icon>
              </div>
              <br>
              <div>
                {{ state.interview.start | calendar }} for {{ duration }}
              </div>
              <div v-if="state.interview.notes">
                <br>
                <br>
                <div>
                  <span class="font-weight-bold">Notes</span>
                  <v-icon class="float-right">mdi-note-text</v-icon>
                </div>
                <br>
                <div>
                  {{ state.interview.notes }}
                </div>
              </div>

            </v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item v-if="!mini">
          <v-card flat class="ma-0 pa-0">
            <v-card-text class="white--text ma-1 pa-0">
              <div class="section-heading">Files</div>
              <FileTree></FileTree>
            </v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item v-if="!mini">
          <v-card flat>
            <v-card-text class="white--text">
              <div class="section-heading">Search</div>
            </v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item v-if="!mini && state.interview.git">
          <v-card flat>
            <v-card-text class="white--text">
              <div class="section-heading">Repository</div>
              <Git></Git>
            </v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item v-if="!mini && state.interview.uploads">
          <v-card flat>
            <v-card-text class="white--text">
              <div class="section-heading">Uploads</div>
              <UploadList></UploadList>
            </v-card-text>
          </v-card>
        </v-tab-item>

        <v-tab-item v-if="!mini">
          <v-card flat>
            <v-card-text class="white--text">
              <div class="section-heading">Settings</div>
              <Settings></Settings>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
      <Upload v-if="sideTab === 4"></Upload>
    </v-navigation-drawer>

    <v-app-bar app color="#222" dark clipped-left dense fixed height="40" class="title">
      <v-btn dense small tile icon @click.stop="toggleSide"><v-icon>mdi-comment-multiple</v-icon></v-btn>
      <v-toolbar-title class="pl-2 title">INTERROGATIVE.IO</v-toolbar-title>
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
    <Notifications></Notifications>
  </div>
</div>
</template>

<script>
import state from '../state';
import Editor from '../components/Editor';
import FileTabs from '../components/FileTabs';
import FileTree from '../components/FileTree';
import Git from '../components/Git';
import Notifications from '../components/Notifications';
import Settings from '../components/Settings';
import Terminal from '../components/Terminal';
import Upload from '../components/Upload';
import UploadList from '../components/UploadList';
import moment from 'moment';

export default {
  name: 'interview',
  components: {
    Editor,
    FileTabs,
    FileTree,
    Git,
    Notifications,
    Settings,
    Terminal,
    Upload,
    UploadList
  },
  data: () => {
    return {
      state,
      mini: true,
      socket: null,
      sideTab: undefined,
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
      } ]
    };
  },
  computed: { duration () {
    let diff = this.state.interview.stop - this.state.interview.start;
    const days = Math.floor(diff / 86400000);
    diff = diff % 86400000;
    const hours = Math.floor(diff / 3600000);
    diff = diff % 3600000;
    const minutes = Math.floor(diff / 60000);

    const duration = [];
    if (days > 0) {
      duration.push(`${ days } days`);
    }
    if (hours > 0) {
      duration.push(`${ hours } hours`);
    }
    if (minutes > 0) {
      duration.push(`${ minutes } minutes`);
    }

    return duration.join(', ');
  } },
  filters: {
    calendar (value) {
      return moment(value).calendar();
    },
    plural (word, array) {
      if (array.length !== 1) {
        return `${ word }s`;
      }
      return word;
    }
  },
  methods: {
    userFilter (role) {
      return this.state.interview.users.filter((user) => {
        return user.role === role;
      });
    },
    sideTabChange (value) {
      if (value === undefined) {
        this.mini = true;
      }
    },
    toggleSide () {
      this.mini = !this.mini;
      if (!this.mini && this.sideTab === undefined) {
        this.sideTab = 0;
      }
    }
  },
  mounted () {
    this.state.id = this.$route.params.id;

    this.$api.get(`/interview/${ this.state.id }/ready`).
      then((interview) => {
        Object.assign(this.state.interview, interview.data);
        this.connection = this.$connect(this.state.id);
        this.state.ready = true;
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
.section-heading {
    font-weight: 700;
    margin-bottom: 12px;
}
</style>
