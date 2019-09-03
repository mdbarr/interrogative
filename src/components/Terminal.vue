<template>
  <div ref="terminal" class="terminal"></div>
</template>

<script>
import { Terminal } from 'xterm';
import * as attach from 'xterm/lib/addons/attach/attach';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks';

import 'xterm/dist/xterm.css';

Terminal.applyAddon(attach);
Terminal.applyAddon(fit);
Terminal.applyAddon(webLinks);

export default {
  name: 'terminal',
  props: { id: String },
  data () {
    return {
      element: null,
      xterm: null,
      socket: null
    };
  },
  methods: { focus (event) {
    if (event.data.id === this.id) {
      this.$nextTick(() => {
        this.xterm.resize(100, 24);
        this.xterm.focus();
      });
    }
  } },
  mounted () {
    console.log('creating terminal', this.id);
    this.element = this.$refs.terminal;

    this.xterm = new Terminal({
      cols: 100,
      rows: 24,
      rendererType: 'dom',
      fontFamily: '"Source Code Pro", monospace',
      fontSize: 12,
      letterSpacing: 0,
      lineHeight: 1,
      rightClickSelectsWord: true,
      macOptionIsMeta: true,
      theme: {
        background: '#222',
        selection: 'rgba(0, 165, 255, 0.25)'
      }
    });

    this.socket = this.$socket(`/shell?id=${ this.id }`);
    this.xterm.attach(this.socket);

    this.$events.on('terminal:tab:focus', this.focus);

    this.$nextTick(() => {
      this.xterm.open(this.element);
      this.xterm.focus();
    });
  },
  destroyed () {
    this.$events.off('terminal:tab:focus', this.focus);
  }
};
</script>

<style>
.terminal {
    height: 388px !important;
    min-width: 720px !important;
    background-color: #222;
}
</style>
