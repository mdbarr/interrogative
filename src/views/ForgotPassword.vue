<template>
  <v-content>
    <v-container
      class="fill-height"
      fluid
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          sm="8"
          md="4"
          align="center"
          justify="center"
        >
          <img
            src="../assets/logo-lock.svg"
            width="150"
            class="pb-3"
          >
          <v-card flat>
            <div class="lock-logo pa-2">
              INTERROGATIVE.IO - FORGOT PASSWORD
            </div>
            <v-card-text v-if="!done">
              Enter your email address and we will send you a link to reset your password.
              <v-form ref="form">
                <v-text-field
                  ref="email"
                  v-model="email"
                  label="Email"
                  type="email"
                  :rules="[ validateEmail ]"
                  @input="available = null"
                />
              </v-form>
            </v-card-text>
            <v-card-text v-else>
              We've sent you an email with a link to reset your password.
            </v-card-text>
            <v-card-actions v-if="!done">
              <div class="flex-grow-1" />
              <v-btn
                :loading="loading"
                :disabled="!valid"
                color="#0087af"
                @click.stop="forgot"
              >
                Send Reset Link
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-content>
</template>

<script>
import state from '../state';

export default {
  name: 'ForgotPassword',
  data () {
    return {
      state,
      email: '',
      loading: false,
      done: false,
    };
  },
  computed: { valid () {
    return this.email && this.validateEmail(this.email) === true;
  } },
  methods: {
    forgot () {
      if (this.$refs.form.validate()) {
        this.loading = true;

        this.$api.post('/users/forgot', { email: this.email }).
          then((response) => {
            this.loading = false;
            this.done = true;
          }).
          catch((error) => {
            this.loading = false;
            this.email = '';

            this.$events.emit({
              type: 'notification:email:not-found',
              data: {
                level: 'failure',
                message: error.response.data.message,
              },
            });
          });
      }
    },
    validateEmail (value = '') {
      if (!/^[^]+@[^]+\.[^]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return true;
    },
  },
};
</script>

<style>
.lock-logo {
  font-family: Inconsolata, monospace;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}

s {
  color: #2196f3;
}
</style>
