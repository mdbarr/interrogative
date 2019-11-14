<template>
  <div ref="terminal" class="terminal"></div>
</template>

<script>
import state from '../state';
import { Terminal } from 'xterm';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';

import 'xterm/css/xterm.css';

export default {
  name: 'terminal',
  props: {
    id: String, type: String
  },
  data () {
    return {
      state,
      element: null,
      xterm: null,
      socket: null,
      cols: 100,
      rows: 24
    };
  },
  computed: { bell () {
    return state.bell;
  } },
  methods: { focus (event) {
    if (event.data.id === this.id) {
      this.$nextTick(() => {
        this.xterm.$fitAddon.fit();
        this.xterm.focus();
      });
    }
  } },
  mounted () {
    console.log(`creating ${ this.type }: ${ this.id }`);
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
        foreground: '#fff',
        background: '#222',
        cursorAccent: '#222',
        selection: 'rgba(0, 165, 255, 0.25)'
      },
      convertEol: this.type === 'action-simple',
      cursorBlink: this.type !== 'action-simple',
      disableStdin: this.type === 'action-simple',
      bellStyle: 'sound'
    });

    this.xterm.$fitAddon = new FitAddon();
    this.xterm.loadAddon(this.xterm.$fitAddon);

    this.socket = this.$socket(`/terminal?id=${ this.id }`);

    const attachAddon = new AttachAddon(this.socket);
    this.xterm.loadAddon(attachAddon);

    this.$events.on('terminal:tab:focus', this.focus);

    setTimeout(() => {
      this.xterm.open(this.element);
      this.xterm.$fitAddon.fit();
      this.xterm.focus();

      console.log('xterm fit', this.xterm.rows, this.xterm.cols);
    }, 0);
  },
  destroyed () {
    this.$events.off('terminal:tab:focus', this.focus);
  },
  watch: { bell (value) {
    this.xterm.setOption('bellStyle', value);
    window.localStorage.setItem('bell', value);
  } }
};
</script>

<style>
.terminal {
    height: 360px !important;
    min-width: 720px !important;
    background-color: #222;
}
</style>
