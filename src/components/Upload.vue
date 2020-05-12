<template>
  <div
    ref="dropzone"
    class="dropzone"
    @dragover.prevent="dragover"
    @dragleave="dragleave"
    @drop="drop"
    @click="$refs.file.click()"
  >
    <div
      v-if="!dragging"
      class="unactionable"
    >
      Click or Drop files here to upload
    </div>
    <div
      v-else
      class="unactionable"
    >
      <v-icon
        x-large
        color="#3598DA"
      >
        mdi-check
      </v-icon>
    </div>
    <input
      ref="file"
      type="file"
      style="display: none;"
      @change="changed"
    >
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid';
import state from '../state';
import utils from '../utils';

export default {
  name: 'Upload',
  data () {
    return {
      state,
      dragging: false,
      url: `${ window.location.origin }/api${ window.location.pathname }/upload`,
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

      if (files.length === 1) {
        this.upload(files[0], true);
      } else {
        for (const file of files) {
          this.upload(file);
        }
      }
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
    },
    upload (file, open = false) {
      const item = {
        id: uuid(),
        name: file.name,
        extension: file.name.replace(/^.*\.([^.]+)$/, '$1'),
        mime: 'text/plain',
        type: file.type,
        size: file.size,
        uploader: state.name,
        progress: 0,
        failed: false,
        completed: false,
        timestamp: Date.now(),
      };
      utils.setAttributes(item);
      console.log(item);

      if (item.size > this.state.config.uploads.maxSize) {
        const maximum = this.formatBytes(this.state.config.uploads.maxSize);

        this.$events.emit({
          type: 'file:upload:failed',
          data: {
            ...item,
            message: `${ file.name } is too big; maximum upload size is ${ maximum }`,
          },
        });
      } else {
        this.$events.emit({
          type: 'file:upload:start',
          data: item,
        });

        const formData = new FormData();
        formData.append('file', file);

        this.$api.upload(this.url, formData, (event) => {
          item.progress = Math.floor((event.loaded / event.total) * 100);

          this.$events.emit({
            type: 'file:upload:progress',
            data: item,
          });

          console.log(item.progress);
        }).
          then((response) => {
            item.completed = true;
            item.path = response.data.path;
            console.log(response);
            this.$events.emit({
              type: 'file:upload:success',
              data: item,
            });

            if (open) {
              this.$events.emit({
                type: 'files:file:open',
                data: { path: item.path },
              });
            }
          }).
          catch((error) => {
            item.failed = true;
            item.error = error;
            this.$events.emit({
              type: 'file:upload:failed',
              data: item,
            });
          });
      }
    },
  },
};
</script>

<style>
.dropzone {
  background-color: #424242;
  border: 1px dashed white;
  bottom: 8px;
  color: white;
  cursor: pointer;
  font-family: Source Code Pro, monospace;
  font-size: 14px;
  height: 150px;
  left: 8px;
  line-height: 142px;
  padding: 2px;
  position: fixed;
  text-align: center;
  text-transform: uppercase;
  width: 332px;
}

.dropzone-drag {
  background-color: #555;
}

.unactionable {
  pointer-events: none;
}
</style>
