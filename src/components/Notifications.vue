<template>
  <v-snackbar
    v-model="show"
    top
    :color="color"
  >
    <span class="font-weight-bold">{{ message }}</span>
    <v-btn
      icon
      @click="show = false"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
import state from '../state';

export default {
  name: 'Notifications',
  data () {
    return {
      state,
      show: false,
      message: '',
      color: 'green'
    };
  },
  mounted () {
    this.$events.on('notification:*', (event) => {
      if (event.type === 'notification:user:joined' &&
          event.data.reference === this.state.user) {
        return;
      }

      this.message = event.data.message;

      if (event.data.level === 'info') {
        this.color = 'light-blue';
      } else if (event.data.level === 'success') {
        this.color = 'green';
      } else if (event.data.level === 'failure' || event.data.level === 'failed') {
        this.color = 'red';
      } else {
        this.color = 'purple';
      }

      this.show = true;
    });
  }
};
</script>

<style>

</style>
