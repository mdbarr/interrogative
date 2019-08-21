<template>
<div>
  Settings<br><br>

  <div>
    <span class="font-weight-bold">Editor</span><v-icon class="float-right">mdi-circle-edit-outline</v-icon>
  </div>
  <br>
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
  <br><br>
  <div>
    <span class="font-weight-bold">Terminal</span><v-icon class="float-right">mdi-console</v-icon>
  </div>
  <br>

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
.float-right {
    float: right;
}
</style>
