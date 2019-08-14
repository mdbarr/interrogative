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
      list: []
    };
  },
  methods: {
    editorTabChange (value) {
      this.$events.emit({
        type: 'editor:tab:focus',
        data: {
          tab: this.tab,
          path: null
        }
      });
    },
    focus (event) {
      if (this.tab !== event.data.tab) {
        this.tab = event.data.tab;
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
  },
  destroyed () {
    this.$events.off('editor:tab:focus', this.focus);
  }
};
</script>

<style>
.closeable:hover {
    color: red !important;
}
</style>
