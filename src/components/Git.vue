<template>
  <div>
    <div
      ref="graph"
      v-html="state.gitSVG"
    />
  </div>
</template>

<script>
import state from '../state';

export default {
  name: 'Git',
  data () {
    return { state };
  },
};
</script>

<style>

</style>
