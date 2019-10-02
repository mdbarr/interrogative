<template>
<v-content>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" align="center" justify="center">
        <img v-if="!done" src="../assets/logo-signup.svg" width="150" class="pb-3">
        <img v-else src="../assets/logo-user.svg" width="150" class="pb-3">
        <v-card flat>
          <div class="signup-logo pa-2">
            INTERROGATIVE.IO - SIGN UP
          </div>
          <v-card-text>
            <v-form ref="form" v-if="!done">
              <v-text-field
                autofocus
                label="Full Name *"
                prepend-icon="mdi-account-circle"
                type="text"
                v-model="name"
                ref="name"
                @keyup.enter="pressEnter"
                :rules="[ validateName ]"
                ></v-text-field>

              <v-text-field
                label="Email*"
                prepend-icon="mdi-email"
                type="email"
                v-model="email"
                ref="email"
                @keyup.enter="pressEnter"
                @input="available = null"
                :rules="[ validateEmail ]"
                ></v-text-field>

              <v-text-field
                prepend-icon="mdi-office-building"
                type="text"
                v-model="company"
                ref="company"
                @keyup.enter="pressEnter"
                >
                <template v-slot:label>
                  <div>Company <small>(optional)</small></div>
                </template>
              </v-text-field>

              <v-text-field
                label="Password*"
                prepend-icon="mdi-lock"
                v-model="password"
                ref="password"
                @keyup.enter="pressEnter"
                :append-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="() => (visible = !visible)"
                :type="visible ? 'text' : 'password'"
                :persistent-hint="explanation"
                :hint="hint"
                @focus="explanation = true"
                @blur="explanation = false"
                :rules="[ validatePassword ]"
                ></v-text-field>
              <div class="caption align-left pt-4">By clicking “Sign up” below, you agree to our <router-link to="/terms">Terms of Service</router-link> and <router-link to="/privacy">Privacy Statement</router-link>. We’ll occasionally send you interview reminders and account-related emails.</div>
            </v-form>
            <div v-else class="subtitle-1 white--text">
              Thank you!<br>
              We've sent an email to <span class="font-weight-bold">{{ email }}</span>.<br>
              Please click the link in that message to activate your account.
            </div>
          </v-card-text>
          <v-card-actions v-if="!done">
            <span class="caption pl-2">Already have an account?
              <router-link to="/signin">Sign In</router-link>
            </span>
            <div class="flex-grow-1"></div>
            <v-btn
              :loading="loading"
              :disabled="!name || !email || !password"
              @click.stop="signup"
              color="#0087af"
              >
              Sign up
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
  name: 'signup',
  data () {
    return {
      state,
      name: '',
      email: '',
      company: '',
      password: '',
      hint: '',
      visible: false,
      loading: false,
      explanation: false,
      available: true,
      done: false
    };
  },
  methods: {
    pressEnter (event) {
      if (this.name && this.email && this.password) {
        this.signup();
      } else if (event.target === this.$refs.name.$refs.input) {
        this.$refs.email.focus();
      } else if (event.target === this.$refs.email.$refs.input) {
        this.$refs.company.focus();
      } else if (event.target === this.$refs.company.$refs.input) {
        this.$refs.password.focus();
      } else if (event.target === this.$refs.password.$refs.input) {
        this.$refs.name.focus();
      }
    },
    signup () {
      if (this.$refs.form.validate()) {
        this.loading = true;

        this.$api.post('/users/signup', {
          name: this.name,
          email: this.email,
          company: this.company,
          password: this.password
        }).
          then((response) => {
            this.done = true;
            this.loading = false;
          }).
          catch((error) => {
            this.$events.emit({
              type: 'notification:signup:failed',
              data: {
                level: 'failure',
                message: error.message
              }
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
    validateName (value = '') {
      if (!/^\w+\s+\w+/.test(value)) {
        return 'Please enter a first and last name';
      }
      return true;
    },
    validateEmail (value = '') {
      if (!/^[^]+@[^]+\.[^]+$/.test(value)) {
        return 'Please enter a valid email address';
      } else if (this.available === false) {
        return 'This email address is already associated with an account';
      }

      this.$api.get(`/users/available?email=${ value }`).
        then((response) => {
          if (response.data.email === this.email) {
            this.available = response.data.free;
          }
        });

      return true;
    },
    validatePassword (value = '') {
      if (!this.passwordHint()) {
        return this.hint;
      }
      return true;
    }
  },
  watch: { available () {
    this.$refs.email.validate();
  } }
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
.align-left {
    padding: 4px 20px;
    text-align: left;
    width: 100%;
}
s {
  color: #2196f3;
};
</style>
