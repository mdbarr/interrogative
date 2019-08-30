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
      {{ upload.name }}<br>
      {{ upload.size }}<br>
      {{ upload.type }}
    </v-tooltip>
  </div>
</div>
</template>

<script>
import state from '../state';

export default {
  name: 'upload-list',
  data () {
    return { state };
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
