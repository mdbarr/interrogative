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
    Drop files here to upload
  </div>
  <div v-else class="unactionable">
    <v-icon x-large color="#2C87AF">mdi-check</v-icon>
  </div>
  <input type="file" ref="file" style="display: none">
</div>
</template>

<script>
import state from '../state';

export default {
  name: 'upload',
  data () {
    return {
      state,
      dragging: false
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
        this.addFile(file);
      }
    },
    addFile (file) {
      this.state.uploads.push({
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 42
      });
    },
    upload () {
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
