<template>
  <div id="terminal"></div>
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
    this.element = document.getElementById('terminal');
    console.log(this.element.clientWidth, 'x', this.element.clientHeight);
    console.log(this.element.parentNode.clientWidth, 'x', this.element.parentNode.clientHeight);

    this.xterm = new Terminal();
    this.xterm.setOption('fontSize', 14);
    this.xterm.setOption('rightClickSelectsWord', true);
    this.xterm.setOption('macOptionIsMeta', true);
    this.xterm.setOption('theme', {
      background: '#222',
      selection: '#006399'
    });

    this.socket = new WebSocket('ws://10.1.1.88:3169/attach/shell');

    this.xterm.open(this.element);

    this.xterm.fit();
    this.xterm.attach(this.socket);
  }
};
</script>

<style>
#terminal {
    height: 384px !important;
}
</style>
