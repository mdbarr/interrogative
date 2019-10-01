<template>
<v-content>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" align="center" justify="center">
        <img src="../assets/logo-signup.svg" width="150" class="pb-3">
        <v-card flat>
          <div class="signup-logo pa-2">
            INTERROGATIVE.IO - FORGOT PASSWORD
          </div>
          <v-card-text>
            <v-form ref="form">
              <v-text-field
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                v-model="email"
                ref="email"
                @input="available = null"
                :rules="[ validateEmail ]"
                ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn
              :loading="loading"
              :disabled="!email"
              @click.stop="forgot"
              color="#0087af"
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
  name: 'forgot-password',
  data () {
    return {
      state,
      email: '',
      loading: false
    };
  },
  methods: {
    forgot () {
      if (this.$refs.form.validate()) {
        this.loading = true;

        this.$api.post('/users/forgot', { email: this.email }).
          then((response) => {
            this.loading = false;
          }).
          catch((error) => {
            console.log(error);
          });
      }
    },
    validateEmail (value = '') {
      if (!/^[^]+@[^]+\.[^]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return true;
    }
  }
};
</script>

<style>
.signup-logo {
    text-align: center;
    font-family: Inconsolata, monospace;
    letter-spacing: 3px;
    font-size: 18px;
    font-weight: 700;
}
s {
  color: #2196f3;
};
</style>
