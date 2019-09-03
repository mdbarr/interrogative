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
  props: { instance: Number },
  data () {
    return {
      element: null,
      xterm: null,
      socket: null
    };
  },
  mounted () {
    console.log('creating terminal', this.instance);
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

    this.socket = this.$socket(`/shell?instance=${ this.instance }`);
    this.xterm.attach(this.socket);
  }
};
</script>

<style>
#terminal {
    height: 388px !important;
    background-color: #222;
}
</style>
