<template>
<v-content>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" align="center" justify="center">
        <img src="../assets/logo-signup.svg" width="150" class="pb-3">
        <v-card flat>
          <div class="signup-logo pa-2">
            INTERROGATIVE.IO - SIGN UP
          </div>
          <v-card-text>
            <v-form>
              <v-text-field
                autofocus
                label="Full Name *"
                prepend-icon="mdi-account-circle"
                type="text"
                v-model="name"
                ref="name"
                @keyup.enter="pressEnter"
                width="100"
                ></v-text-field>

              <v-text-field
                label="Email*"
                prepend-icon="mdi-email"
                type="email"
                v-model="email"
                ref="email"
                @keyup.enter="pressEnter"
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
                ></v-text-field>
            </v-form>
            <div class="caption align-left">By clicking “Sign up” below, you agree to our <router-link to="/terms">Terms of Service</router-link> and <router-link to="/privacy">Privacy Statement</router-link>. We’ll occasionally send you account-related emails.</div>
          </v-card-text>
          <v-card-actions>
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
      visible: false,
      loading: false
    };
  },
  methods: {
    pressEnter () {
      console.log('enter');
    },
    signup () {
      console.log('sign up');
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
.align-left {
    padding: 4px 20px;
    text-align: left;
    width: 100%;
}
</style>
