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
              INTERROGATIVE.IO - RESET PASSWORD
            </div>
            <v-card-text>
              <v-form ref="form">
                <v-text-field
                  ref="password"
                  v-model="password"
                  label="Password"
                  prepend-icon="mdi-lock"
                  :append-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                  :type="visible ? 'text' : 'password'"
                  :persistent-hint="explanation"
                  :hint="hint"
                  :rules="[ validatePassword ]"
                  @click:append="() => (visible = !visible)"
                  @focus="explanation = true"
                  @blur="explanation = false"
                />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <div class="flex-grow-1" />
              <v-btn
                :loading="loading"
                :disabled="!password"
                color="#0087af"
                @click.stop="reset"
              >
                Reset and Sign In
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
  name: 'ResetPassword',
  data () {
    return {
      state,
      password: '',
      hint: '',
      visible: false,
      loading: false,
      explanation: false,
    };
  },
  methods: {
    reset () {
      if (this.$refs.form.validate()) {
        this.loading = true;

        this.$api.post(`/users/${ this.$route.params.id }/reset`, {
          id: this.$route.params.id,
          password: this.password,
        }).
          then((response) => {
            this.$events.emit({
              type: 'notification:password:reset',
              data: {
                level: 'success',
                message: 'Password reset',
              },
            });
            this.$session(response.data);
            this.$navigate('dashboard');
          }).
          catch((error) => {
            this.loading = false;
            this.password = '';

            this.$events.emit({
              type: 'notification:reset:failure',
              data: {
                level: 'failure',
                message: error.response.data.message,
              },
            });
          });
      }
    },
    passwordHint () {
      const hints = [];
      let valid = true;

      if (/[A-Z]/.test(this.password)) {
        hints.push('<s>Uppercase Letter</s>');
      } else {
        hints.push('Uppercase Letter');
        valid = false;
      }

      if (/[a-z]/.test(this.password)) {
        hints.push('<s>Lowercase Letter</s>');
      } else {
        hints.push('Lowercase Letter');
        valid = false;
      }

      if (/[0-9]/.test(this.password)) {
        hints.push('<s>Number</s>');
      } else {
        hints.push('Number');
        valid = false;
      }

      if (/[!@#$%^&*(),.?":{}|<>]/.test(this.password)) {
        hints.push('<s>Special Character</s>');
      } else {
        hints.push('Special Character');
        valid = false;
      }

      if (this.password.length >= 8) {
        hints.push('<s>Eight Character Minimum</s>');
      } else {
        hints.push('Eight Character Minimum');
        valid = false;
      }

      this.hint = hints.join(', ');
      return valid;
    },
    validatePassword (value = '') {
      if (!this.passwordHint()) {
        return this.hint;
      }
      return true;
    },
  },
};
</script>

<style>
.lock-logo {
  text-align: center;
  font-family: Inconsolata, monospace;
  letter-spacing: 3px;
  font-size: 18px;
  font-weight: 700;
}

s {
  color: #2196f3;
}
</style>
