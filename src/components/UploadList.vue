<template>
<v-list dense>
  <v-list-item v-for="upload of state.uploads" :key="upload.id" class="pr-0" @click="open(upload)">
    <v-list-item-icon class="mr-0">
      <v-icon small :color="upload.color">{{ upload.icon }}</v-icon>
    </v-list-item-icon>
    <v-list-item-content class="pt-0 pb-0">
      <v-list-item-title>
        <span class="uploading pl-0">{{ upload.name }}</span>
        <v-tooltip left nudge-top="-59" nudge-left="-5">
          <template v-slot:activator="{ on }">
            <span class="float-right pr-1" v-on="on">
              <v-icon small>mdi-information-outline</v-icon>
            </span>
          </template>
          <div class="caption">
            <v-icon small class="pr-3" :color="upload.color">{{ upload.icon }}</v-icon>
            {{ upload.name }} ({{ upload.size | formatBytes }})<br>
            <v-icon small class="pr-3">mdi-account-plus mdi-flip-h</v-icon>{{ upload.uploader }}<br>
            <v-icon small class="pr-3">mdi-calendar-import</v-icon>{{ upload.timestamp | calendar }}<br>
          </div>
          <span class="float-right"></span>
        </v-tooltip>
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
  },
  methods: { open (item) {
    if (item.progress === 100) {
      if (this.state.files[item.path]) {
        this.$events.emit({
          type: 'editor:tab:focus',
          data: { path: item.path }
        });
      } else {
        this.$events.emit({
          type: 'files:file:open',
          data: { path: item.path }
        });
      }
    }
  } }
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
.float-right {
    float: right;
}
</style>
