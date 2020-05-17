<template>
  <v-list dense>
    <v-list-item
      v-for="upload of state.uploads"
      :key="upload.id"
      class="pr-0"
      @click="open(upload)"
    >
      <v-list-item-icon class="mr-0">
        <v-icon
          small
          :color="upload.color"
        >
          {{ upload.icon }}
        </v-icon>
      </v-list-item-icon>
      <v-list-item-content class="pt-0 pb-0">
        <v-list-item-title>
          <div class="uploading upload-item pl-0 pt-2">
            {{ upload.name }}
          </div>
          <v-tooltip
            left
            nudge-top="-59"
            nudge-left="-5"
          >
            <template v-slot:activator="{ on }">
              <span
                class="float-right pr-1 pt-2"
                v-on="on"
              >
                <v-icon small>mdi-information-outline</v-icon>
              </span>
            </template>
            <div class="caption">
              <v-icon
                small
                class="pr-3"
                :color="upload.color"
              >
                {{ upload.icon }}
              </v-icon>
              {{ upload.name }} ({{ upload.size | formatBytes }})<br>
              <v-icon
                small
                class="pr-3"
              >
                mdi-account-plus mdi-flip-h
              </v-icon>{{ upload.uploader }}<br>
              <v-icon
                small
                class="pr-3"
              >
                mdi-calendar-import
              </v-icon>{{ upload.timestamp | calendar }}<br>
            </div>
            <span class="float-right" />
          </v-tooltip>
          <div class="progress-holder pt-1">
            <v-progress-linear
              v-if="upload.progress < 100"
              v-model="upload.progress"
              height="2"
              buffer-value="0"
              stream
            />
          </div>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import state from '../state';

export default {
  name: 'UploadList',
  data () {
    return { state };
  },
  methods: {
    open (item) {
      if (item.progress === 100) {
        if (this.state.files[item.path]) {
          this.$events.emit({
            type: 'editor:tab:focus',
            data: { path: item.path },
          });
        } else {
          this.$events.emit({
            type: 'files:file:open',
            data: { path: item.path },
          });
        }
      }
    },
  },
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

.upload-item {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
