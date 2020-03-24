<template>
  <div id="interview">
    <div v-if="!state.ready">
      <v-overlay>
        <v-progress-circular
          v-if="!error"
          indeterminate
          size="200"
          width="3"
          color="white"
        />
        <div
          v-if="error"
          class="error-message"
        >
          <img
            v-if="error.includes('available')"
            src="../assets/logo-clock.svg"
            width="250"
          >
          <img
            v-else
            src="../assets/logo-frown.svg"
            width="250"
          >
          <br><br>
          <span v-html="error" />
        </div>
      </v-overlay>
    </div>
    <div v-else-if="state.disconnected">
      <v-overlay class="error-message">
        <img
          src="../assets/logo-hourglass.svg"
          width="250"
        >
        <br><br>
        <span v-if="state.role === 'candidate'">
          This interview has concluded.
        </span>
        <span v-else>
          Your interview session has timed out.
          <a @click="reload">Refresh the browser</a> to reconnect.
        </span>
      </v-overlay>
    </div>
    <div v-else>
      <v-navigation-drawer
        color="#424242"
        permanent
        :mini-variant.sync="state.mini"
        mini-variant-width="45"
        width="345"
        app
        clipped
      >
        <v-tabs
          v-model="sideTab"
          vertical
          background-color="#424242"
          slider-color="white"
          slider-size="2"
          optional
          @change="sideTabChange"
        >
          <v-tab class="white--text">
            <v-icon left>
              mdi-account-multiple
            </v-icon>
          </v-tab>
          <v-tab class="white--text">
            <v-icon left>
              mdi-folder
            </v-icon>
          </v-tab>
          <v-tab class="white--text">
            <v-icon left>
              mdi-file-search
            </v-icon>
          </v-tab>
          <v-tab
            v-if="state.interview.git"
            class="white--text"
          >
            <v-icon left>
              mdi-source-branch
            </v-icon>
          </v-tab>
          <v-tab
            v-if="state.interview.uploads"
            class="white--text"
          >
            <v-icon left>
              mdi-cloud-upload
            </v-icon>
          </v-tab>
          <v-tab class="white--text">
            <v-icon left>
              mdi-settings
            </v-icon>
          </v-tab>
          <v-tab
            v-if="state.role === 'interviewer'"
            class="white--text"
          >
            <v-icon left>
              mdi-timeline-text
            </v-icon>
          </v-tab>
          <v-tab
            v-if="state.role === 'interviewer'"
            class="white--text"
          >
            <v-icon left>
              mdi-tools
            </v-icon>
          </v-tab>

          <v-tab-item v-if="!state.mini">
            <v-card
              flat
              tile
              color="#424242"
            >
              <v-card-text
                v-if="state.interview.id"
                class="white--text"
              >
                <div
                  v-if="state.interview.title"
                  class="section-heading"
                >
                  {{ state.interview.title }}
                </div>
                <div
                  v-else
                  class="section-heading"
                >
                  Interview
                </div>
                <div>
                  <span class="font-weight-bold">{{ 'Candidate' | plural(userFilter('candidate')) }}</span>
                  <v-icon class="float-right">
                    mdi-comment-account
                  </v-icon>
                </div>
                <div
                  v-for="user of userFilter('candidate')"
                  :key="user.id"
                >
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        v-if="state.online[user.id]"
                        x-small
                        color="green"
                        class="pr-1"
                        title="online"
                        v-on="on"
                      >
                        mdi-circle
                      </v-icon>
                      <v-icon
                        v-else
                        x-small
                        color="red"
                        class="pr-1"
                        v-on="on"
                      >
                        mdi-checkbox-blank-circle-outline
                      </v-icon>
                    </template>
                    <span v-if="state.online[user.id]">{{ user.name }} is online</span>
                    <span v-else>{{ user.name }} is not online</span>
                  </v-tooltip>
                  {{ user.name }}
                </div>
                <div v-if="state.interview.position">
                  <v-icon
                    small
                    class="pl-5 pr-2"
                  >
                    mdi-laptop-windows
                  </v-icon>
                  {{ state.interview.position }}
                </div>
                <br>
                <br>
                <div>
                  <span class="font-weight-bold">{{ 'Interviewer' | plural(userFilter('interviewer')) }}</span>
                  <v-icon class="float-right">
                    mdi-comment-account-outline mdi-flip-h
                  </v-icon>
                </div>
                <br>
                <div
                  v-for="user of userFilter('interviewer')"
                  :key="user.id"
                >
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        v-if="state.online[user.id]"
                        x-small
                        color="green"
                        class="pr-1"
                        title="online"
                        v-on="on"
                      >
                        mdi-circle
                      </v-icon>
                      <v-icon
                        v-else
                        x-small
                        color="red"
                        class="pr-1"
                        v-on="on"
                      >
                        mdi-checkbox-blank-circle-outline
                      </v-icon>
                    </template>
                    <span v-if="state.online[user.id]">{{ user.name }} is online</span>
                    <span v-else>{{ user.name }} is not online</span>
                  </v-tooltip>
                  {{ user.name }}
                </div>
                <div v-if="state.interview.company">
                  <v-icon
                    small
                    class="pl-5 pr-2"
                  >
                    mdi-office-building
                  </v-icon>
                  {{ state.interview.company }}
                </div>
                <br>
                <br>
                <div>
                  <span class="font-weight-bold">When</span>
                  <v-icon class="float-right">
                    mdi-calendar-clock
                  </v-icon>
                </div>
                <br>
                <div>
                  {{ state.interview.start | calendar }} for {{ state.interview.duration | duration }}
                </div>
                <div v-if="state.interview.notes">
                  <br>
                  <br>
                  <div>
                    <span class="font-weight-bold">Notes</span>
                    <v-icon class="float-right">
                      mdi-note-text
                    </v-icon>
                  </div>
                  <br>
                  <div>
                    {{ state.interview.notes }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab-item v-if="!state.mini">
            <v-card
              flat
              tile
              color="#424242"
            >
              <v-card-text class="white--text">
                <div class="section-heading">
                  Files
                </div>
                <FileTree />
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab-item v-if="!state.mini">
            <v-card
              flat
              tile
              color="#424242"
            >
              <v-card-text class="white--text">
                <div class="section-heading">
                  Search
                </div>
                <Search
                  :id="2"
                  :tab="sideTab"
                />
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab-item v-if="!state.mini && state.interview.git">
            <v-card
              flat
              tile
              color="#424242"
            >
              <v-card-text class="white--text">
                <div class="section-heading">
                  Repository
                </div>
                <Git />
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab-item v-if="!state.mini && state.interview.uploads">
            <v-card
              flat
              tile
              color="#424242"
            >
              <v-card-text class="white--text">
                <div class="section-heading">
                  Uploads
                </div>
                <UploadList />
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab-item v-if="!state.mini">
            <v-card
              flat
              tile
              color="#424242"
            >
              <v-card-text class="white--text">
                <div class="section-heading">
                  Settings
                </div>
                <Settings />
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab-item v-if="!state.mini && state.role === 'interviewer'">
            <v-card
              flat
              tile
              color="#424242"
            >
              <v-card-text class="white--text">
                <div class="section-heading">
                  Timeline
                </div>
                <Timeline />
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab-item v-if="!state.mini && state.role === 'interviewer'">
            <v-card
              flat
              tile
              color="#424242"
            >
              <v-card-text class="white--text">
                <div class="section-heading">
                  Tools
                </div>
                <Tools />
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
        <Upload v-if="sideTab === 4" />
      </v-navigation-drawer>

      <v-app-bar
        app
        color="#222"
        dark
        clipped-left
        dense
        fixed
        height="40"
        class="title"
      >
        <v-btn
          dense
          small
          tile
          icon
          class="pl-3"
          @click.stop="toggleSide"
        >
          <img
            src="../assets/logo.svg"
            width="30"
            class="app-bar-logo"
          >
        </v-btn>
        <v-toolbar-title class="pl-4 app-bar-title">
          INTERROGATIVE.IO
        </v-toolbar-title>
        <v-spacer />
        <ActionButton
          v-for="action of state.interview.actions"
          :key="action.id"
          :action="action"
        />
        <span class="text-uppercase subtitle-2 pl-2 pr-2">
          {{ state.name }}
        </span>
        <v-icon
          v-if="state.name"
          class="pr-1"
        >
          mdi-account-circle
        </v-icon>
      </v-app-bar>

      <v-content color="#222">
        <v-container
          fluid
          fill-height
          class="ma-0 pl-0 main-area"
        >
          <v-layout wrap>
            <v-flex xs12>
              <v-card
                class="ma-0 main-card"
                flat
                tile
              >
                <FileTabs />
                <Editor />
              </v-card>
            </v-flex>
            <v-flex xs12>
              <v-card
                class="ma-0 main-card"
                flat
                tile
              >
                <Terminals />
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
      <v-footer
        color="#333"
        app
        dark
        height="20"
        class="caption pa-0 ma-0"
      >
        <span class="pl-2">&copy; 2019</span>
      </v-footer>
    </div>
  </div>
</template>

<script>
import state from '../state';
import ActionButton from '../components/ActionButton';
import Editor from '../components/Editor';
import FileTabs from '../components/FileTabs';
import FileTree from '../components/FileTree';
import Git from '../components/Git';
import Search from '../components/Search';
import Settings from '../components/Settings';
import Terminals from '../components/Terminals';
import Timeline from '../components/Timeline';
import Tools from '../components/Tools';
import Upload from '../components/Upload';
import UploadList from '../components/UploadList';

export default {
  name: 'Interview',
  components: {
    ActionButton,
    Editor,
    FileTabs,
    FileTree,
    Git,
    Search,
    Settings,
    Terminals,
    Timeline,
    Tools,
    Upload,
    UploadList,
  },
  data: () => {
    return {
      state,
      error: false,
      sideTab: undefined,
    };
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
          console.log(error.response);
          if (error.response.status === 404) {
            this.error = `Interview ${ this.state.id } was not found.`;
          } else if (error.response.status === 409) {
            this.error = error.response.data.message;
          } else {
            this.error = error.response.data.message;
          }
        } else {
          this.error = error.message;
        }
      });
  },
  destroyed () { },
  methods: {
    userFilter (role) {
      return this.state.interview.users.filter((user) => {
        return user.role === role;
      });
    },
    reload () {
      window.location.reload();
    },
    sideTabChange (value) {
      if (value === undefined) {
        this.state.mini = true;
      }
    },
    toggleSide () {
      this.state.mini = !this.state.mini;
      if (!this.state.mini && this.sideTab === undefined) {
        this.sideTab = 0;
      }
    },
  },
};
</script>

<style>
.v-tab {
  min-width: 48px !important;
  padding-left: 6px !important;
  padding-right: 0 !important;
}

.v-tabs-items {
  background-color: #424242 !important;
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
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-right: 0 !important;
}

.main-card {
  background-color: #222 !important;
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
