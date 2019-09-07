<template>
<div id="interview">
  <div v-if="!state.ready">
    <v-overlay>
      <v-progress-circular v-if="!error" indeterminate size="200" width="3" color="white"></v-progress-circular>
      <div v-if="error" class="error-message">
        <img src="../assets/logo-frown.svg" width="250">
        <br><br>
        <span v-html="error"></span>
      </div>
    </v-overlay>
  </div>
  <div v-else>
    <v-overlay v-if="state.disconnected">
      <img src="../assets/logo-frown.svg" width="250">
      <br><br>
      Timed out, please reload
    </v-overlay>
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
                <v-icon small class="pr-2">mdi-laptop-windows</v-icon>
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
                     <v-icon v-on="on" v-else x-small color="red" class="pr-1">mdi-checkbox-blank-circle-outline</v-icon>
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
          <v-card flat>
            <v-card-text class="white--text">
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
      <v-btn dense small tile icon @click.stop="toggleSide" class="pl-3">
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
            <v-card class="ma-0" flat tile>
              <FileTabs></FileTabs>
              <Editor></Editor>
            </v-card>
          </v-flex>
          <v-flex xs12>
            <v-card class="ma-0" flat tile>
              <Terminals></Terminals>
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
import Terminals from '../components/Terminals';
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
    Terminals,
    Upload,
    UploadList
  },
  data: () => {
    return {
      state,
      mini: true,
      error: false,
      errorColor: 'red darken-2',
      sideTab: undefined
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
      }).
      catch((error) => {
        if (error.response) {
          if (error.response.status === 404) {
            this.error = `Interview ${ this.state.id } was not found.`;
          } else if (error.response.status === 409) {
            this.errorColor = 'green';
            this.error = 'This interview is currently unavailable. <br>Please try again during the scheduled time.';
          } else {
            this.error = error.response.statusText;
          }
        } else {
          this.error = error.message;
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
.error-message {
    text-align: center;
}
.app-bar-logo {
    margin-top: -2px;
}
.app-bar-title {
    font-family: Inconsolata, monospace;
    letter-spacing: 3px;
    font-size: 22px;
    line-height: 22px;
}
</style>
