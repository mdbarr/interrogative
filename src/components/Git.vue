<template>
<div>
  <div ref="graph" v-html="state.gitSVG"></div>
</div>
</template>

<script>
import state from '../state';

export default {
  name: 'git',
  data () {
    return { state };
  }
};
</script>

<style>

</style>
