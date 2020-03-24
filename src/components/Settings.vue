<template>
  <div>
    <div>
      <span class="font-weight-bold">Editor</span><v-icon class="float-right">
        mdi-circle-edit-outline
      </v-icon>
    </div>
    <br>
    <v-select
      v-model="state.theme"
      :items="state.settings.themes"
      prepend-icon="mdi-theme-light-dark"
      dense
      label="Theme"
      class="caption"
    />
    <br>
    <v-select
      v-model="state.keymap"
      :items="state.settings.keymaps"
      prepend-icon="mdi-keyboard"
      dense
      label="Key Map"
      class="caption"
    />
    <br><br>
    <div>
      <span class="font-weight-bold">Terminal</span><v-icon class="float-right">
        mdi-console
      </v-icon>
    </div>
    <br>
    <v-switch
      v-model="state.bell"
      class="pl-5 ma-0"
      color="white"
      label="Bell"
      :false-value="'none'"
      :true-value="'sound'"
    >
      <template v-slot:prepend>
        <v-icon
          small
          class="pt-1"
        >
          mdi-bell-off
        </v-icon>
      </template>
      <template v-slot:append>
        <v-icon
          small
          class="pt-1"
        >
          mdi-bell
        </v-icon>
      </template>
    </v-switch>
  </div>
</template>

<script>
import state from '../state';

export default {
  name: 'Settings',
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
