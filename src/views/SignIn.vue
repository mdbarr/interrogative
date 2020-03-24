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
        >
          <v-card
            color="#303030"
            flat
          >
            <div class="signin-logo">
              <img
                src="../assets/logo.svg"
                width="200"
              ><br>
              INTERROGATIVE.IO
            </div>
            <v-card-text>
              <v-form>
                <v-text-field
                  ref="username"
                  v-model="username"
                  autofocus
                  label="Email"
                  prepend-icon="mdi-account-circle"
                  type="text"
                  @keyup.enter="pressEnter"
                />

                <v-text-field
                  id="password"
                  ref="password"
                  v-model="password"
                  label="Password"
                  prepend-icon="mdi-lock"
                  type="password"
                  @keyup.enter="pressEnter"
                />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <span class="caption">No account?
                <router-link to="/signup">Sign Up</router-link>
              </span>
              <div class="flex-grow-1" />
              <span class="caption"><router-link to="/forgot">Forgot Password?</router-link>
              </span>
              <div class="flex-grow-1" />
              <v-btn
                :loading="loading"
                :disabled="!username || !password"
                color="#0087af"
                @click.stop="signin"
              >
                Sign in
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
  name: 'Signin',
  data () {
    return {
      state,
      username: '',
      password: '',
      loading: false
    };
  },
  methods: {
    pressEnter () {
      if (this.$refs.username.value.length && this.$refs.password.value.length) {
        this.signin();
      } else if (this.$refs.username.value.length) {
        this.$refs.password.focus();
      } else if (this.$refs.password.value.length) {
        this.$refs.username.focus();
      }
    },
    navigate (where) {
      this.$router.push({ name: where });
    },
    signin () {
      this.loading = true;

      this.$api.post('/session', {
        username: this.username,
        password: this.password
      }).
        then((response) => {
          this.$session(response.data);
          this.$navigate('dashboard');
        }).
        catch((error) => {
          this.$refs.username.focus();
          this.loading = false;

          this.$events.emit({
            type: 'notification:signin:failure',
            data: {
              level: 'failure',
              message: error.response.data.message
            }
          });
        });
    }
  }
};
</script>

<style>
.signin-logo {
    text-align: center;
    font-family: Inconsolata, monospace;
    letter-spacing: 6px;
    font-size: 22px;
    font-weight: 700;
    line-height: 22px;
}
</style>
