<template>
<v-tabs show-arrows v-model="tab" color="white" height="30" slider-color="white" class="tab-bg back" @change="editorTabChange">
  <v-btn dense small tile icon left height="30" class="plus-button">
    <v-icon small>mdi-plus</v-icon>
  </v-btn>
  <v-tab v-for="item of state.files" :key="item.path" class="tab-bg pl-2 pr-2">
    <v-icon v-if="item.icon" small class="pr-2">mdi-{{ item.icon }}</v-icon>
    <span class="pr-1">{{ item.name }}</span>
    <v-icon v-if="item.closeable" small class="pl-2 closeable" @click.stop="close(item)">mdi-close</v-icon>
  </v-tab>
</v-tabs>
</template>

<script>
import state from '../state';

export default {
  name: 'file-tabs',
  components: { },
  data: () => {
    return {
      state,
      tab: -1,
      path: '',
      list: []
    };
  },
  methods: {
    editorTabChange (value) {
      this.path = this.list[value];
      console.log(this.tab, this.path);
      this.$events.emit({
        type: 'editor:tab:focus',
        data: { path: this.path }
      });
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
    close (item) {
      console.log('close', item);
    },
    plus () {
    }
  },
  mounted () {
    this.$events.on('editor:tab:focus', this.focus);
    this.$events.on('files:file:opened', this.opened);
  },
  destroyed () {
    this.$events.off('editor:tab:focus', this.focus);
    this.$events.off('files:file:opened', this.opened);
  }
};
</script>

<style>
.closeable:hover {
    color: red !important;
}
</style>
