<template>
<div class="pt-1">
  <div v-for="upload of state.uploads" :key="upload.name">
    <v-icon small>mdi-cloud-upload</v-icon>
    <span class="uploading pl-2">{{ upload.name }}</span>
    <div class="progress-holder">
      <v-progress-linear v-model="upload.progress" v-if="upload.progress < 100" height="2">
      </v-progress-linear>
    </div>
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
