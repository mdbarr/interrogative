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
    console.log('clicked', this.action, this.state.focus);
    console.log('focus', this.state.focus);
    this.$events.emit({
      type: 'action:tab:open',
      data: this.action
    });
  } }
};
</script>

<style>

</style>
