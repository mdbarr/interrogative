<template>
  <v-dialog
    v-model="show"
    width="400"
  >
    <v-card class="ma-1">
      <v-card-title
        class="title new-item-title pa-2"
        color="red"
      >
        <v-icon
          left
          class="pl-1 pr-1"
        >
          mdi-{{ isFolder ? 'folder' : 'file' }}-plus
        </v-icon> Create {{ isFolder ? 'Folder' : 'File' }}
      </v-card-title>
      <v-card-text class="pb-0">
        <v-switch
          v-model="isFolder"
          color="amber lighten-2"
        >
          <template v-slot:prepend>
            <v-icon>mdi-file</v-icon>
          </template>
          <template v-slot:append>
            <v-icon color="amber lighten-2">
              mdi-folder-open
            </v-icon>
          </template>
        </v-switch>
        <v-text-field
          ref="name"
          v-model="name"
          autofocus
          dense
          label="Name"
          class="mb-5"
          @keyup.enter="create"
        >
          <template v-slot:prepend>
            <v-icon
              v-if="isFolder"
              color="amber lighten-2"
            >
              mdi-folder
            </v-icon>
            <v-icon
              v-else
              :color="color"
            >
              {{ icon }}
            </v-icon>
          </template>
        </v-text-field>
        <v-select
          v-model="path"
          dense
          :items="state.directories"
          item-id="path"
          item-text="name"
          item-value="path"
          label="Folder"
          class="mb-3"
        >
          <template v-slot:prepend>
            <v-icon color="amber lighten-2">
              mdi-folder-open
            </v-icon>
          </template>
          <template
            v-slot:item="{ item }"
            class="subtitle-1"
          >
            {{ '&nbsp;'.repeat(item.depth * 3) }}
            <v-icon
              color="amber lighten-2"
              class="pr-2"
            >
              {{ item.icon }}
            </v-icon>
            {{ item.name }}
          </template>
        </v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          @click="show = false"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          text
          :disabled="!name || !path"
          @click="create"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import state from '../state';
import utils from '../utils';

export default {
  name: 'NewItem',
  props: { value: Boolean },
  data () {
    return {
      state,
      name: '',
      path: '',
      isFolder: false,
      icon: 'mdi-file',
      color: 'white',
    };
  },
  computed: { show: {
    get () {
      return this.value;
    },
    set (value) {
      if (!value) {
        this.$emit('close');
      }
    },
  } },
  watch: {
    name (name) {
      const extension = name.includes('.') ? name.replace(/^.*\.([^.]+$)/, '$1') : '';
      console.log('extension', extension);
      if (extension) {
        const item = {
          name: this.name,
          path: this.path,
          extension,
        };
        utils.setAttributes(item);
        console.log(item);

        this.icon = item.icon;
        this.color = item.color;
      }
    },
    value (display) {
      if (display) {
        this.path = this.state.directories[this.state.directories.length - 1].path;
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.$refs.name.focus();
          });
        });
      } else {
        this.path = '';
        this.name = '';
        this.isFolder = false;
        this.icon = 'mdi-file';
        this.color = 'white';
      }
    },
  },
  mounted () { },
  methods: { create () {
    console.log('create', this.name, this.path, this.isFolder);
    this.$events.emit({
      type: 'files:file:create',
      data: {
        name: this.name,
        path: this.path,
        type: this.isFolder ? 'directory' : 'file',
      },
    });
    this.show = false;
  } },
};
</script>

<style>
.new-item-title {
  background-color: #333;
}
</style>
