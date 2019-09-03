<template>
  <div ref="terminal"></div>
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
      rows: 24
    });
    this.xterm.setOption('rendererType', 'dom');

    this.xterm.setOption('fontFamily', '"Source Code Pro", monospace');
    this.xterm.setOption('fontSize', 12);
    this.xterm.setOption('letterSpacing', 0);
    this.xterm.setOption('lineHeight', 1);

    this.xterm.setOption('rightClickSelectsWord', true);
    this.xterm.setOption('macOptionIsMeta', true);

    this.xterm.setOption('theme', {
      background: '#222',
      selection: 'rgba(0, 165, 255, 0.25)'
    });

    this.xterm.open(this.element);

    this.socket = this.$socket(`/shell?id=${ this.id }`);
    this.xterm.attach(this.socket);

    this.$events.on('terminal:tab:focus', this.focus);
  },
  destroyed () {
    this.$events.off('terminal:tab:focus', this.focus);
  }
};
</script>

<style>
#terminal {
    height: 388px !important;
    background-color: #222;
}
</style>
