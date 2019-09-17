<template>
<div>
  <v-tabs show-arrows v-model="tab" color="white" height="30" slider-color="white" @change="tabChange">
    <v-btn dense small tile icon left height="30" class="plus-button" @click.stop="plus">
      <v-icon small>mdi-plus</v-icon>
    </v-btn>
    <v-tab v-for="item of state.terminals" :key="item.index" class="tab-bg pl-2 pr-2">
      <v-icon v-if="item.icon" small class="pr-2">mdi-{{ item.icon }}</v-icon>
      <span class="pr-1">{{ item.name }}</span>
      <v-icon v-if="item.closeable" small class="pl-2" @click="close(item.id)">mdi-close</v-icon>
    </v-tab>
  </v-tabs>
  <div v-for="item of state.terminals" :key="item.index">
    <div v-if="item.type === 'terminal'">
      <Terminal v-show="current === item.id" :id="item.id"></Terminal>
    </div>
    <div v-if="item.type === 'chat'">
      <Chat v-show="current === item.id" :id="item.id"></Chat>
    </div>
  </div>
</div>
</template>

<script>
import state from '../state';
import Chat from '../components/Chat';
import Terminal from '../components/Terminal';

export default {
  name: 'terminals',
  components: {
    Chat,
    Terminal
  },
  data () {
    return {
      state,
      current: '',
      list: [],
      tabs: new Map(),
      tab: 0
    };
  },
  methods: {
    tabChange (value) {
      this.current = this.list[value];
      this.$events.emit({
        type: 'terminal:tab:focus',
        data: { id: this.current }
      });
    },
    focus (event) {
      if (this.current !== event.data.id) {
        this.current = event.data.id;
        this.tab = this.list.indexOf(this.current);
      }
    },
    opened (event) {
      this.tabs.set(event.data.id, event.data);
      this.list.push(event.data.id);
    },
    update (event) {
      this.tabs.clear();
      for (const tab of event.data) {
        if (!this.list.includes(tab.id)) {
          this.list.push(tab.id);
          this.tabs.set(tab.id, tab);
        }
      }
    },
    closed (event) {
      if (this.list.includes(event.data.id)) {
        const index = this.list.indexOf(event.data.id);
        this.list.splice(index, 1);
      }
    },
    plus () {
      this.$events.emit({ type: 'terminal:tab:open' });
    },
    close (id) {
      this.$events.emit({
        type: 'terminal:tab:close',
        data: { id }
      });
    }
  },
  mounted () {
    this.$events.on('terminal:tab:focus', this.focus);
    this.$events.on('terminal:tab:closed', this.closed);
    this.$events.on('terminal:tab:list', this.update);
    this.$events.on('terminal:tab:opened', this.opened);
  },
  destroyed () {
    this.$events.off('terminal:tab:focus', this.focus);
    this.$events.off('terminal:tab:closed', this.closed);
    this.$events.off('terminal:tab:list', this.update);
    this.$events.off('terminal:tab:opened', this.opened);
  }
};
</script>

<style>

</style>
