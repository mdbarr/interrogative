<template>
<div id="file-tree" class="ma-0 pa-0">
  <v-treeview dense hoverable open-all :items="state.tree" :open.sync="state.treeOpen" item-key="path" class="subtitle ma-0 pa-0">
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="item.type === 'directory'" small color="amber lighten-1" class="clickable">
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else small :color="item.color" @click.stop="open(item)" class="clickable">
        {{ item.icon }}
      </v-icon>
    </template>

    <template v-slot:label="{ item }">
      <div @click.stop="open(item)" class="caption clickable">{{ item.name }}</div>
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
  },
  methods: {
    hover (item) {
      // Tooltip
    },
    open (item) {
      if (item.type === 'directory') {
        if (this.state.treeOpen.includes(item.path)) {
          this.state.treeOpen.splice(this.state.treeOpen.indexOf(item.path), 1);
        } else {
          this.state.treeOpen.push(item.path);
        }
      } else if (this.state.files[item.path]) {
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
  }
};
</script>

<style>
.v-treeview-node__root {
    height: 26px !important;
    min-height: 26px !important;
}
.clickable {
    cursor: pointer;
}
</style>
