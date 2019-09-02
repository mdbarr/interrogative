<template>
<div class="pt-1">
  <div v-for="upload of state.uploads" :key="upload.id">
    <v-tooltip bottom nudge-top="18">
      <template v-slot:activator="{ on }">
        <div v-on="on">
          <v-icon small :color="upload.color">{{ upload.icon }}</v-icon>
          <span class="uploading pl-2">{{ upload.name }}</span>
          <div class="progress-holder">
            <v-progress-linear
              v-if="upload.progress < 100"
              v-model="upload.progress"
              height="2"
              buffer-value="0"
              stream
              >
            </v-progress-linear>
          </div>
        </div>
      </template>
      <v-icon small :color="upload.color" class="pr-3">{{ upload.icon }}</v-icon>{{ upload.name }}
      ({{ upload.size | formatBytes }})<br>
      <v-icon small class="pr-3">mdi-account-plus mdi-flip-h</v-icon>{{ upload.uploader }}<br>
      <v-icon small class="pr-3">mdi-calendar-import</v-icon>{{ upload.timestamp | calendar }}<br>
    </v-tooltip>
  </div>
</div>
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
