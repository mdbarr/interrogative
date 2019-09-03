<template>
<div>
  <v-tabs show-arrows v-model="tab" color="white" height="30" slider-color="white">
    <v-btn dense small tile icon left height="30" class="plus-button" @click="plus">
      <v-icon small>mdi-plus</v-icon>
    </v-btn>
    <v-tab v-for="item of tabs" :key="item.index" class="tab-bg pl-2 pr-2">
      <v-icon v-if="item.icon" small class="pr-2">mdi-{{ item.icon }}</v-icon>
      <span class="pr-1">{{ item.name }}</span>
      <v-icon v-if="item.closeable" small class="pl-2">mdi-close</v-icon>
    </v-tab>
  </v-tabs>
  <div v-for="item of tabs" :key="item.index">
    <div v-if="item.type === 'terminal'">
      <Terminal v-show="tab === item.index" :instance="item.index"></Terminal>
    </div>
    <div v-if="item.type === 'messages'">
      <div v-show="tab === item.index">Messages</div>
    </div>
  </div>
</div>
</template>

<script>
import state from '../state';
import Terminal from '../components/Terminal';

export default {
  name: 'terminals',
  components: { Terminal },
  data () {
    return {
      state,
      tab: 0,
      tabs: [ {
        index: 0,
        name: 'Terminal',
        type: 'terminal',
        icon: 'console',
        closeable: false
      }, {
        index: 1,
        name: 'Messages',
        type: 'messages',
        icon: 'forum',
        closeable: false
      } ]
    };
  },
  methods: {
    plus () {
      const terminal = {
        index: this.tabs.length,
        name: 'Terminal',
        type: 'terminal',
        icon: 'console',
        closeable: true
      };
      this.tab = terminal.index;
      this.tabs.push(terminal);
    },
    close () {
    }
  }
};
</script>

<style>

</style>
