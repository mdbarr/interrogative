<template>
<v-snackbar v-model="show" top :color="color">
  {{ message }}
  <v-btn icon @click="show = false"><v-icon>mdi-close</v-icon></v-btn>
</v-snackbar>
</template>

<script>
import state from '../state';

export default {
  name: 'notifications',
  data () {
    return {
      state,
      show: false,
      message: '',
      color: 'success'
    };
  },
  mounted () {
    this.state.$events.on('notification', (event) => {
      this.message = event.data.message;
      this.color = event.data.color || 'success';
      this.show = true;
    });
  }
};
</script>

<style>

</style>
