<template>
<v-content>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card color="#303030" flat>
          <div class="login-logo">
            <img src="../assets/logo.svg" width="200"><br>
            INTERROGATIVE.IO
          </div>
          <v-card-text>
            <v-form>
              <v-text-field
                autofocus
                label="Login"
                name="login"
                prepend-icon="mdi-account-circle"
                type="text"
                ></v-text-field>

              <v-text-field
                id="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="#0083af">Login</v-btn>
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
  name: 'login',
  data () {
    return { state };
  }
};
</script>

<style>
.login-logo {
    text-align: center;
    font-family: Inconsolata, monospace;
    letter-spacing: 3px;
    font-size: 22px;
    line-height: 22px;
}
</style>
