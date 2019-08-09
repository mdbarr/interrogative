<template>
<div>
  <v-navigation-drawer
    v-model="drawer"
    app
    clipped
    >
    <v-list dense>
      <v-list-item @click="true">
        <v-list-item-action>
          <v-icon>mdi-home</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="true">
        <v-list-item-action>
          <v-icon>mdi-mail</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Contact</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-app-bar
    app
    color="indigo"
    dark
    clipped-left
    >
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>Application</v-toolbar-title>
  </v-app-bar>

  <v-content>
    <v-container
      fluid
      fill-height
      >
      <v-layout
        align-center
        justify-center
        >
        <v-flex text-center>
          <v-tooltip left>
            <template v-slot:activator="{ on }">
              <v-btn
                :href="source"
                icon
                large
                target="_blank"
                v-on="on"
                >
                <v-icon large>mdi-code-tags</v-icon>
              </v-btn>
            </template>
            <span>Source</span>
          </v-tooltip>

          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                large
                href="https://codepen.io/johnjleider/pen/zgxeLQ"
                target="_blank"
                v-on="on"
                >
                <v-icon large>mdi-codepen</v-icon>
              </v-btn>
            </template>
            <span>Codepen</span>
          </v-tooltip>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
  <v-footer
    color="indigo"
    app
    >
    <span class="white--text">&copy; 2019</span>
  </v-footer>
</div>
</template>

<script>
export default {
  name: 'home',
  components: {},
  data: () => {
    return { drawer: null };
  }
};
</script>
