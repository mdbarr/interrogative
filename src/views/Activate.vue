<template>
  <v-overlay>
    <v-progress-circular
      v-if="!error"
      indeterminate
      size="200"
      width="3"
      color="white"
    />
    <div
      v-if="error"
      class="error-message"
    >
      <img
        src="../assets/logo-frown.svg"
        width="250"
      >
      <br><br>
      <span v-html="error" />
    </div>
  </v-overlay>
</template>

<script>
import state from '../state';

export default {
  name: 'Activate',
  data () {
    return {
      state,
      error: null,
      activation: null
    };
  },
  mounted () {
    this.activation = this.$route.params.id;
    this.$api.get(`/users/${ this.activation }/activate`).
      then((response) => {
        this.$events.emit({
          type: 'notification:account:activated',
          data: {
            level: 'success',
            message: 'Account activated'
          }
        });
        this.$session(response.data);
        this.$navigate('dashboard');
      }).
      catch((error) => {
        this.error = error.response.data.message;
      });
  }
};
</script>

<style>
.error-message {
    text-align: center;
}
</style>
