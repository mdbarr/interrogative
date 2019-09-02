<template>
<div
  class="dropzone"
  @dragover.prevent="dragover"
  @dragleave="dragleave"
  @drop="drop"
  @click="$refs.file.click()"
  ref="dropzone"
  >
  <div v-if="!dragging" class="unactionable">
    Click or Drop files here to upload
  </div>
  <div v-else class="unactionable">
    <v-icon x-large color="#2C87AF">mdi-check</v-icon>
  </div>
  <input type="file" ref="file" style="display: none" @change="changed">
</div>
</template>

<script>
import uuid from 'uuid/v4';
import state from '../state';

export default {
  name: 'upload',
  data () {
    return {
      state,
      dragging: false,
      url: `${ window.location.origin }/api${ window.location.pathname }/upload`
    };
  },
  methods: {
    setDrag () {
      if (!this.dragging) {
        this.dragging = true;
        this.$refs.dropzone.classList.add('dropzone-drag');
      }
    },
    clearDrag () {
      if (this.dragging) {
        this.dragging = false;
        this.$refs.dropzone.classList.remove('dropzone-drag');
      }
    },
    changed (event) {
      console.log('changed', event);
      const files = this.$refs.file.files;
      if (files.length) {
        for (const file of files) {
          this.upload(file);
        }
        this.$refs.file.value = '';
      }
    },
    dragover (event) {
      this.setDrag();
    },
    dragleave (event) {
      this.clearDrag();
    },
    drop (event) {
      event.stopPropagation();
      event.preventDefault();

      this.clearDrag();

      const files = event.dataTransfer.files;
      console.log(files);
      for (const file of files) {
        this.upload(file);
      }
    },
    upload (file) {
      const item = {
        id: uuid(),
        name: file.name,
        extension: file.name.replace(/^.*\.([^.]+)$/, '$1'),
        type: file.type,
        size: file.size,
        uploader: state.name,
        progress: 0,
        failed: false,
        completed: false,
        timestamp: Date.now()
      };
      this.setAttributes(item);
      console.log(item);

      this.$events.emit({
        type: 'file:upload:start',
        data: item
      });

      const formData = new FormData();
      formData.append('file', file);

      this.$api.upload(this.url, formData, (event) => {
        item.progress = Math.floor((event.loaded / event.total) * 100);

        this.$events.emit({
          type: 'file:upload:progress',
          data: item
        });

        console.log(item.progress);
      }).
        then((response) => {
          item.completed = true;
          item.path = response.data.path;
          console.log(response);
          this.$events.emit({
            type: 'file:upload:success',
            data: item
          });
        }).
        catch((error) => {
          item.failed = true;
          this.$events.emit({
            type: 'file:upload:failed',
            data: {
              item,
              error
            }
          });
        });
    },
    setAttributes (item) {
      item.color = 'white';
      item.icon = 'file';

      if (item.name === 'Dockerfile') { // names
        item.mime = 'text/x-dockerfile';
        item.color = '#3A8CB4';
        item.icon = 'docker';
      } else if (item.name === 'CMakeLists.txt') {
        item.mime = 'text/x-cmake';
        item.color = '#649AD2';
        item.icon = 'language-c';
      } else if (item.name === 'package.json') {
        item.mime = 'application/json';
        item.color = '#F53E44';
        item.icon = 'npm-variant-outline';
      } else if (item.name === 'yarn.lock') {
        item.mime = 'text/plain';
        item.color = '#89BB5A';
        item.icon = 'nodejs';
      } else if (item.name === '.browserslistrc') {
        item.mime = 'text/plain';
        item.icon = 'web-box';
      } else if (item.name === '.editorconfig') {
        item.mime = 'text/plain';
        item.icon = 'pencil-box';
      } else if (item.name === '.gitignore') {
        item.mime = 'text/plain';
        item.color = '#F54D27';
        item.icon = 'git';
      } else if (item.name.startsWith('.bash')) {
        item.mime = 'text/x-sh';
        item.icon = 'file-code';
      } else if (item.extension === 'c' || item.extension === 'h') { // extensions
        item.mime = 'text/x-csrc';
        item.icon = 'langauge-c';
        item.color = '#649AD2';
      } else if (item.extension === 'cpp' || item.extension === 'hpp') {
        item.mime = 'text/x-csrc';
        item.icon = 'language-cpp';
        item.color = '#649AD2';
      } else if (item.extension === 'css') {
        item.mime = 'text/x-css';
        item.color = '#2673BA';
        item.icon = 'language-css3';
      } else if (item.extension === 'diff' || item.extension === 'patch') {
        item.mime = 'text/x-diff';
        item.icon = 'vector-difference';
      } else if (item.extension === 'groovy') {
        item.mime = 'text/x-groovy';
        item.color = '#5382A1';
        item.icon = 'language-java';
      } else if (item.extension === 'hs' || item.extension === 'lhs') {
        item.mime = 'text/x-haskell';
        item.color = '#649AD2';
        item.icon = 'language-haskell';
      } else if (item.extension === 'html' || item.extension === 'htm') {
        item.mime = 'text/html';
        item.color = '#E44D26';
        item.icon = 'language-html5';
      } else if ([ 'dmg', 'hddimg', 'img', 'iso', 'pkg' ].includes(item.extension)) {
        item.icon = 'folder-zip';
      } else if (item.extension === 'java') {
        item.mime = 'text/x-java';
        item.color = '#5382A1';
        item.icon = 'language-java';
      } else if (item.extension === 'js') {
        item.mime = 'text/javascript';
        item.color = '#F0DB4F';
        item.icon = 'language-javascript';
      } else if (item.extension === 'json') {
        item.mime = 'application/json';
        item.icon = 'json';
      } else if (item.extension === 'md') {
        item.mime = 'text/x-markdown';
        item.color = '#9927E5';
        item.icon = 'markdown';
      } else if (item.extension === 'pdf') {
        item.color = '#DB1B23';
        item.icon = 'file-pdf';
      } else if (item.extension === 'pl' || item.extension === 'pm') {
        item.mime = 'text/x-perl';
        item.icon = 'file-code';
      } else if (item.extension === 'php') {
        item.mime = 'text/x-php';
        item.icon = 'language-php';
      } else if (item.extension === 'py') {
        item.mime = 'text/x-python';
        item.color = '#3674A5';
        item.icon = 'language-python';
      } else if (item.extension === 'rst') {
        item.mime = 'text/x-rst';
        item.icon = 'file-document';
      } else if (item.extension === 'rb') {
        item.mime = 'text/x-ruby';
      } else if (item.extension === 'sc' || item.extension === 'scala') {
        item.mime = 'text/x-scala';
        item.icon = 'file-code';
      } else if (item.extension === 'scss') {
        item.mime = 'text/x-scss';
        item.color = '#2673BA';
        item.icon = 'language-css3';
      } else if (item.extension === 'sh' || item.extension === 'bash') {
        item.mime = 'text/x-sh';
        item.icon = 'file-code';
      } else if (item.extension === 'svg') {
        item.icon = 'svg';
      } else if (item.extension === 'ts') {
        item.mime = 'text/typescript';
        item.color = '#2A7ACC';
        item.icon = 'language-typescript';
      } else if (item.extension === 'vue') {
        item.mime = 'text/x-vue';
        item.color = '#41B883';
        item.icon = 'vuejs';
      } else if (item.extenision === 'yml' || item.extension === 'yaml') {
        item.mime = 'text/x-yaml';
        item.icon = 'file-code';
      } else if (item.extension === 'xml') {
        item.mime = 'application/xml';
        item.icon = 'file-code';
      } else if (item.extension === 'gif') {
        item.icon = 'gif';
      } else if ([ 'bmp', 'gif', 'ico', 'jpeg', 'jpg', 'png' ].includes(item.extension)) {
        item.icon = 'file-image';
      } else if ([ 'eot', 'otf', 'ttf', 'woff', 'woff2' ].includes(item.extension)) {
        item.icon = 'format-font';
      }

      if (item.name.includes('eslint')) { // special cases
        item.color = '#8080F2';
        item.icon = 'eslint';
      } else if (item.name.endsWith('.js.map')) {
        item.mime = 'text/javascript';
        item.color = '#F0DB4F';
        item.icon = 'language-javascript';
      }

      item.icon = `mdi-${ item.icon }`;
    }
  }
};
</script>

<style>
.dropzone {
    background-color: #424242;
    color: white;
    padding: 2px;
    height: 150px;
    width: 329px;
    border: 1px dashed white;
    font-family: Source Code Pro, monospace;
    font-size: 14px;
    text-transform: uppercase;
    position: fixed;
    left: 8px;
    bottom: 8px;
    cursor: pointer;
    text-align: center;
    line-height: 142px;
}
.dropzone-drag {
    background-color: #555;
}
.unactionable {
    pointer-events: none;
}
</style>
