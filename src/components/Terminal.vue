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
  data () {
    return {
      element: null,
      xterm: null,
      socket: null
    };
  },
  mounted () {
    this.element = this.$refs.terminal;

    this.xterm = new Terminal();
    this.xterm.setOption('fontFamily', 'Inconsolata');
    this.xterm.setOption('fontSize', 14);

    this.xterm.setOption('rightClickSelectsWord', true);
    this.xterm.setOption('macOptionIsMeta', true);
    this.xterm.setOption('theme', {
      background: '#222',
      selection: 'rgba(0, 165, 255, 0.25)'
    });

    this.xterm.open(this.element);

    this.xterm.onResize(({
      cols, rows
    }) => {
      if (!this.socket) {
        this.socket = this.$socket(`attach/shell?cols=${ cols }&rows=${ rows }`);
        this.xterm.attach(this.socket);
      }
    });

    this.$nextTick(() => {
      this.xterm.fit();
    });
  }
};
</script>

<style>
#terminal {
    height: 388px !important;
    background-color: #222;
    padding: 2px;
}
</style>
