<template>
<div class="tools pl-4">
  <v-btn small><v-icon small left>mdi-file</v-icon> Clear Open Files</v-btn><br>
  <v-btn small><v-icon small left>mdi-cloud-upload</v-icon>Clear Uploads</v-btn><br>
  <v-btn small><v-icon small left>mdi-forum</v-icon>Clear Chat</v-btn><br>
  <v-btn small><v-icon small left>mdi-close</v-icon>End Interview</v-btn>
</div>
</template>

<script>
import state from '../state';

export default {
  name: 'tools',
  data () {
    return { state };
  }
};
</script>

<style>
.tools {
    line-height: 50px;
}
</style>
