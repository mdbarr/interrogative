<template>
<v-dialog v-model="show" width="400">
  <v-card class="ma-1">
    <v-card-title class="title new-item-title pa-2" color="red">
      <v-icon left>mdi-plus</v-icon> Create {{ isFolder ? 'Folder' : 'File' }}
    </v-card-title>
    <v-card-text class="pb-0">
      <v-text-field
        dense
        label="Name"
        v-model="name"
        >
        <template v-slot:prepend>
          <v-icon v-if="isFolder" color="amber lighten-2">mdi-folder-plus</v-icon>
          <v-icon v-else>mdi-file-plus</v-icon>
        </template>
      </v-text-field>
      <v-select
        dense
        :items="state.directories"
        item-id="path"
        item-text="name"
        item-value="path"
        label="Folder"
        v-model="path"
        >
        <template v-slot:prepend>
          <v-icon color="amber lighten-2">mdi-folder-open</v-icon>
        </template>
        <template v-slot:item="{ item }">
          {{ '&nbsp;'.repeat(item.depth) }} {{ item.name }}
        </template>
      </v-select>
      <v-switch v-model="isFolder" color="amber lighten-2">
        <template v-slot:prepend>
          <v-icon>mdi-file</v-icon>
        </template>
        <template v-slot:append>
          <v-icon color="amber lighten-2">mdi-folder-open</v-icon>
        </template>
      </v-switch>
    </v-card-text>
     <v-card-actions>
       <v-btn text @click="show = false">Cancel</v-btn>
       <v-spacer></v-spacer>
       <v-btn text :disabled="!name || !path" @click="create">Create</v-btn>
     </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script>
import state from '../state';

export default {
  name: 'NewItem',
  props: { value: Boolean },
  computed: { show: {
    get () {
      return this.value;
    },
    set (value) {
      if (!value) {
        this.$emit('close');
      }
    }
  } },
  data () {
    return {
      state,
      name: '',
      path: '',
      isFolder: false
    };
  },
  methods: { create () {
    console.log('create', this.name, this.path, this.isFolder);
    this.$events.emit({
      type: 'files:file:create',
      data: {
        name: this.name,
        path: this.path,
        type: this.isFolder ? 'directory' : 'file'
      }
    });
    this.show = false;
  } },
  mounted () { },
  watch: { value (display) {
    if (display) {
      this.path = this.state.directories[this.state.directories.length - 1].path;
      console.log('setting path', this.path);
    } else {
      this.path = '';
      this.name = '';
      this.isFolder = false;
    }
  } }
};
</script>

<style>
.new-item-title {
    background-color: #333;
}
</style>
