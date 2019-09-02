<template>
<v-list dense>
  <v-list-item v-for="upload of state.uploads" :key="upload.id" class="pr-0" @click="true">
    <v-list-item-icon class="mr-0">
      <v-icon small :color="upload.color">{{ upload.icon }}</v-icon>
    </v-list-item-icon>
    <v-list-item-content class="pt-0 pb-0">
      <v-list-item-title>
        <span class="uploading pl-0">{{ upload.name }}</span>
        <div class="progress-holder pt-1">
          <v-progress-linear
            v-if="upload.progress < 100"
            v-model="upload.progress"
            height="2"
            buffer-value="0"
            stream
            >
          </v-progress-linear>
        </div>
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</v-list>
</template>

<script>
import state from '../state';
import moment from 'moment';

export default {
  name: 'upload-list',
  data () {
    return { state };
  },
  filters: {
    calendar (value = Date.now()) {
      return moment(value).calendar();
    },
    formatBytes (bytes) {
      bytes = Number(bytes) || 0;
      if (bytes === 0) {
        return '0 Bytes';
      }
      const kilobyte = 1024;
      const places = 2;
      const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
      const index = Math.floor(Math.log(bytes) / Math.log(kilobyte));
      return `${ parseFloat((bytes / Math.pow(kilobyte, index)).toFixed(places)) } ${ sizes[index] }`;
    }
  }
};
</script>

<style>
.uploading {
    font-family: Source Code Pro, monospace;
    font-size: 11px;
}
.progress-holder {
    height: 10px;
}
</style>
