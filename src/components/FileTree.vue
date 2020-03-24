<template>
  <div
    id="file-tree"
    class="ma-0 pa-0"
  >
    <v-treeview
      dense
      hoverable
      :items="state.tree"
      :open.sync="state.treeOpen"
      item-key="path"
      class="subtitle ma-0 pa-0"
    >
      <template v-slot:prepend="{ item, open }">
        <v-icon
          v-if="item.type === 'directory'"
          small
          color="amber lighten-2"
          class="clickable"
        >
          {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
        </v-icon>
        <v-icon
          v-else
          small
          :color="item.color"
          class="clickable"
          @click.stop="open(item)"
        >
          {{ item.icon }}
        </v-icon>
      </template>

      <template v-slot:label="{ item }">
        <div
          class="caption clickable"
          @click.stop="open(item)"
          @contextmenu.prevent="showMenu($event, item)"
        >
          {{ item.name }}
        </div>
      </template>
    </v-treeview>
    <v-menu
      v-model="menu"
      :position-x="menuX"
      :position-y="menuY"
      class="ma-0 pa-0"
      close-on-click
      close-on-content-click
    >
      <v-list
        dense
        class="ma-0 pa-0"
      >
        <v-list-item
          v-for="menuItem of menuItems"
          :key="menuItem.title"
          class="pl-2"
          @click="menuCommand(menuItem.command)"
        >
          <v-list-item-icon class="mr-2 pt-1">
            <v-icon small>
              mdi-{{ menuItem.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="caption">
              {{ menuItem.title }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import state from '../state';

export default {
  name: 'FileTree',
  data () {
    return {
      state,
      menu: false,
      menuX: 0,
      menuY: 0,
      menuItems: [ {
        title: 'Open',
        icon: 'open-in-new',
        command: 'open'
      }, {
        title: 'Rename',
        icon: 'rename-box',
        command: 'rename'
      }, {
        title: 'Move',
        icon: 'file-move',
        command: 'move'
      }, {
        title: 'Delete',
        icon: 'trash-can-outline',
        command: 'delete'
      } ],
      selected: null
    };
  },
  methods: {
    menuCommand (command) {
      if (command === 'open') {
        this.open(this.selected);
      }
    },
    showMenu (event, item) {
      this.selected = item;
      this.menuX = event.clientX;
      this.menuY = event.clientY;
      this.menu = true;
      console.log(event);
    },
    move (item) {
      console.log('move', item);
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
    },
    rename (item) {
      console.log('rename', item);
    },
    trash (item) {
      console.log('trash', item);
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
    user-select: none;
}
</style>
