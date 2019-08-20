<template>
<div>
  Settings<br><br>
  <v-select
    v-model="state.theme"
    :items="state.settings.themes"
    prepend-icon="mdi-theme-light-dark"
    dense
    label="Theme"
    class="caption">
  </v-select>
  <br>
  <v-select
    v-model="state.keymap"
    :items="state.settings.keymaps"
    prepend-icon="mdi-keyboard"
    dense
    label="Key Map"
    class="caption">
  </v-select>
</div>
</template>

<script>
import state from '../state';

export default {
  name: 'settings',
  data () {
    return { state };
  }
};
</script>

<style>

</style>
