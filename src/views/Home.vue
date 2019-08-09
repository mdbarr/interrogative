<template>
<div>
  <v-navigation-drawer v-model="drawer" app clipped color="#222">
    <v-list dense dark>
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

  <v-app-bar app color="black" dark clipped-left dense fixed height="40" class="title">
    <v-app-bar-nav-icon small @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title class="title">Blather</v-toolbar-title>
  </v-app-bar>

  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>

      </v-layout>
    </v-container>
  </v-content>
  <v-footer color="black" app dark height="24" class="subtitle-2 pa-0 ma-0">
    <span class="pl-2">&copy; 2019</span>
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
