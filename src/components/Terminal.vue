<template>
  <div id="terminal"></div>
</template>

<script>
import { Terminal } from 'xterm';
import 'xterm/dist/xterm.css';

export default {
  name: 'terminal',
  data () {
    return {
      instance: null,
      history: null
    };
  },
  mounted () {
    this.instance = new Terminal();
    this.instance.open(document.getElementById('terminal'));
  }
};
</script>

<style>

</style>
