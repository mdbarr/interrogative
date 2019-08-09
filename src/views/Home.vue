<template>
<div>
  <v-navigation-drawer permanent :mini-variant.sync="mini" mini-variant-width="45" app clipped>
    <v-tabs vertical dark slider-color="white" slider-size="3">
      <v-tab class="white--text">
        <v-icon left>mdi-folder</v-icon>
      </v-tab>
      <v-tab class="white--text">
        <v-icon left>mdi-source-branch</v-icon>
      </v-tab>
      <v-tab class="white--text">
        <v-icon left>mdi-note</v-icon>
      </v-tab>

      <v-tab-item>
        <v-card flat>
          <v-card-text class="white--text">
            Files
          </v-card-text>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-card flat>
          <v-card-text class="white--text">
            Git
          </v-card-text>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-card flat>
          <v-card-text class="white--text">
            Notes
          </v-card-text>
        </v-card>
      </v-tab-item>

    </v-tabs>
  </v-navigation-drawer>

  <v-app-bar app color="#222" dark clipped-left dense fixed height="40" class="title">
    <v-app-bar-nav-icon dense small tile @click.stop="mini = !mini"></v-app-bar-nav-icon>
    <v-toolbar-title class="title">Blather</v-toolbar-title>
  </v-app-bar>

  <v-content>
    <v-container fluid fill-height class="ma-0 pl-0 main-area">
      <v-layout wrap>
        <v-flex xs12>
          <v-card class="ma-0" flat tile>
            <v-tabs v-model="tab" color="white" height="30" slider-color="white" class="tab-bg back">
              <v-tab v-for="item of tabs" :key="item.name" class="tab-bg pl-2 pr-2">
                {{ item.name }}
                <v-btn icon text tile small>
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </v-tab>
            </v-tabs>
            <CodeMirror ></CodeMirror>
          </v-card>
        </v-flex>
        <v-flex xs12>
          <v-card class="ma-0" flat tile>
            <v-tabs v-model="tab"  color="white" height="30" slider-color="white">
              <v-tab v-for="item of tabs" :key="item.name" class="tab-bg pl-2 pr-2">
                {{ item.name }}
                <v-btn icon text tile small>
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </v-tab>
            </v-tabs>
            <Terminal></Terminal>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
  <v-footer color="#222" app dark height="24" class="subtitle-2 pa-0 ma-0">
    <span class="pl-2">&copy; 2019</span>
  </v-footer>
</div>
</template>

<script>
import CodeMirror from '../components/CodeMirror';
import Terminal from '../components/Terminal';

export default {
  name: 'home',
  components: {
    CodeMirror,
    Terminal
  },
  data: () => {
    return {
      mini: true,
      tab: 0,
      tabs: [ {
        name: 'File 1',
        content: 'Stuuuuff'
      }, {
        name: 'File 2 with a loooong name',
        content: 'Different stuffff'
      } ]
    };
  }
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
</style>
