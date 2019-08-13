<template>
<div id="file-tree" class="ma-0 pa-0">
  <v-treeview dense hoverable open-all :items="state.tree" :open.sync="state.treeOpen" item-key="path" class="subtitle ma-0 pa-0">
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="item.type === 'directory'" small color="amber lighten-1" class="clickable">
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else small :color="fileIcon(item).color" @click.stop="open(item)" class="clickable">
        {{ fileIcon(item).icon }}
      </v-icon>
    </template>

    <template v-slot:label="{ item }">
      <div @click.stop="open(item)" class="caption clickable">{{ item.name }}</div>
    </template>
  </v-treeview>
</div>
</template>

<script>
import state from '../state';

export default {
  name: 'file-tree',
  data () {
    return { state };
  },
  methods: {
    fileIcon (file) {
      const result = {
        icon: 'mdi-file',
        color: 'white'
      };

      if (file.name === 'Dockerfile' || file.name === 'docker-compose.yml') {
        result.color = '#3A8CB4';
        result.icon = 'mdi-docker';
      } else if (file.name === 'package.json' || file.name === 'yarn.lock') {
        result.color = '#89BB5A';
        result.icon = 'mdi-nodejs';
      } else if (file.extension === 'c' || file.extension === 'h') {
        result.color = '#649AD2';
        result.icon = 'mdi-language-c';
      } else if (file.extension === 'cpp' || file.extension === 'hpp') {
        result.color = '#649AD2';
        result.icon = 'mdi-language-cpp';
      } else if (file.extension === 'css') {
        result.color = '#2673BA';
        result.icon = 'mdi-language-css3';
      } else if (file.extension === 'html') {
        result.color = '#E44D26';
        result.icon = 'mdi-language-html5';
      } else if (file.extension === 'gif') {
        result.icon = 'mdi-gif';
      } else if (file.extension === 'ico' || file.extension === 'jpg' ||
               file.extension === 'jpeg' || file.extension === 'png') {
        result.icon = 'mdi-file-image';
      } else if (file.extension === 'java' || file.extension === 'jar') {
        result.color = '#5382A1';
        result.icon = 'mdi-language-java';
      } else if (file.extension === 'js') {
        result.color = '#F0DB4F';
        result.icon = 'mdi-language-javascript';
      } else if (file.extension === 'json') {
        result.icon = 'mdi-json';
      } else if (file.extension === 'md') {
        result.color = '#56157f';
        result.icon = 'mdi-markdown';
      } else if (file.extension === 'php') {
        result.icon = 'mdi-language-php';
      } else if (file.extension === 'py') {
        result.color = '#3674A5';
        result.icon = 'mdi-language-python';
      } else if (file.extension === 'svg') {
        result.icon = 'mdi-svg';
      } else if (file.extension === 'ts') {
        result.color = '#2A7ACC';
        result.icon = 'mdi-language-typescript';
      } else if (file.extension === 'txt') {
        result.icon = 'mdi-file-document';
      } else if (file.extension === 'vue') {
        result.color = '#41B883';
        result.icon = 'mdi-vuejs';
      }

      return result;
    },
    open (item) {
      if (item.type === 'directory') {
        if (this.state.treeOpen.includes(item.path)) {
          this.state.treeOpen.splice(this.state.treeOpen.indexOf(item.path), 1);
        } else {
          this.state.treeOpen.push(item.path);
        }
      } else if (this.state.files[item.path]) {
        const index = Object.keys(this.state.files).indexOf(item.path);
        this.$events.emit({
          type: 'editor:tab:focus',
          data: index
        });
      } else {
        this.$events.emit({
          type: 'files:file:open',
          data: { path: item.path }
        });
      }
    }
  }
};
</script>

<style>
.v-treeview-node__root {
    height: 26px !important;
    min-height: 26px !important;
}
.clickable {
    cursor: pointer;
}
</style>
