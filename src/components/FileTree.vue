<template>
<div id="file-tree" class="ma-0 pa-0">
  <v-treeview dense open-all :items="state.files" :open.sync="state.filesOpen" class="subtitle ma-0 pa-0">
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="item.type === 'directory'" small>
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else small>
        mdi-file
      </v-icon>
    </template>

    <template v-slot:label="{ item }">
      <div class="caption">{{ item.name }}</div>
    </template>
  </v-treeview>
</div>
</template>

<script>
import state from '../state';

export default {
  name: 'file-tree',
  data () {
    return { state };
  }
};
</script>

<style>
.v-treeview-node__root {
    height: 26px !important;
    min-height: 26px !important;
}
</style>
