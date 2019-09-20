<template>
<v-btn icon tile height="40" @click="click"><v-icon>mdi-{{ action.icon }}</v-icon></v-btn>
</template>

<script>
import state from '../state';

export default {
  name: 'action-button',
  props: { action: Object },
  data () {
    return { state };
  },
  methods: { click () {
    this.$events.emit({
      type: 'terminal:tab:open',
      data: this.action
    });
  } }
};
</script>

<style>

</style>
