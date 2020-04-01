<template>
  <v-tabs
    v-model="tab"
    show-arrows
    color="white"
    height="30"
    slider-color="white"
    class="tab-bg back"
    background-color="#424242"
    @change="editorTabChange"
  >
    <v-btn
      dense
      small
      tile
      icon
      left
      height="30"
      class="plus-button"
      @click.stop="newItem = true"
    >
      <v-icon small>
        mdi-plus
      </v-icon>
    </v-btn>
    <v-tab
      v-for="item of state.files"
      :key="item.path"
      class="tab-bg pl-2 pr-2"
    >
      <v-icon
        v-if="item.icon"
        small
        :color="item.color"
        class="pr-2"
      >
        {{ item.icon }}
      </v-icon>
      <span class="pr-1">{{ item.name }}</span>
      <v-icon
        v-if="item.closeable && list.length > 1"
        small
        class="pl-2 closeable"
        @click.stop="closeTab(item)"
      >
        mdi-close
      </v-icon>
    </v-tab>
    <NewItem
      :value="newItem"
      @close="newItem = false"
    />
  </v-tabs>
</template>

<script>
import state from '../state';
import NewItem from './NewItem';

export default {
  name: 'FileTabs',
  components: { NewItem },
  data: () => {
    return {
      state,
      tab: -1,
      path: '',
      list: [],
      newItem: false,
    };
  },
  mounted () {
    this.$events.on('editor:tab:focus', this.focus);
    this.$events.on('files:file:opened', this.opened);
    this.$events.on('files:file:closed', this.closed);
  },
  destroyed () {
    this.$events.off('editor:tab:focus', this.focus);
    this.$events.off('files:file:opened', this.opened);
    this.$events.off('files:file:closed', this.closed);
  },
  methods: {
    editorTabChange (value) {
      if (this.list[value]) {
        this.path = this.list[value];
        console.log('tab change', value, this.path);

        this.$events.emit({
          type: 'editor:tab:focus',
          data: { path: this.path },
        });
      }
    },
    focus (event) {
      if (this.path !== event.data.path) {
        this.path = event.data.path;
        this.tab = this.list.indexOf(this.path);
      }
    },
    opened (event) {
      if (!this.list.includes(event.data.path)) {
        this.list.push(event.data.path);
      }
    },
    closed (event) {
      if (this.list.includes(event.data.path)) {
        const index = this.list.indexOf(event.data.path);
        this.list.splice(index, 1);
      }
    },
    closeTab (item) {
      if (this.path === item.path) {
        const newTab = (this.tab > 0) ? this.tab - 1 : 0;
        const newPath = this.list[newTab];

        this.$events.emit({
          type: 'editor:tab:focus',
          data: { path: newPath },
        });
      }

      this.$events.emit({
        type: 'files:file:closed',
        data: { path: item.path },
      });
    },
    plus () {
    },
  },
};
</script>

<style>
.closeable:hover {
  color: red !important;
}

.v-tabs-items {
  background-color: #424242 !important;
}
</style>
