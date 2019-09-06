<template>
<div class="chat-container">
  <div ref="contents" class="chat-contents">
  </div>
  <v-text-field
    autofocus
    background-color="#222"
    class="chat-input pa-0"
    clear-icon="mdi-close"
    clearable
    flat
    hide-details
    id="chat-input"
    loader-height="0"
    :placeholder="state.name"
    prepend-inner-icon="mdi-chat"
    ref="input"
    v-model="input"
    @keypress.enter="submit"
   ></v-text-field>
</div>
</template>

<script>
import state from '../state';

export default {
  name: 'chat',
  props: { id: String },
  data () {
    return {
      state,
      input: ''
    };
  },
  methods: {
    focus (event) {
      if (event.data.id === this.id) {
        this.$refs.input.focus();
      }
    },
    submit () {
      console.log('input', this.input);
      this.input = '';
    }
  },
  mounted () {
    this.$events.on('terminal:tab:focus', this.focus);
  },
  destroyed () {
    this.$events.off('terminal:tab:focus', this.focus);
  }
};
</script>

<style>
.chat-container {
    height: 360px !important;
    width: 100%;
    background-color: #222;
    padding: 4px;
    font-size: .875rem;
}
.chat-contents {
    height: 320px !important;
    font-size: .875rem;
}
.chat-input {
    font-size: .875rem !important;
}
</style>
