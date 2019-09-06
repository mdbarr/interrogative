<template>
<div class="chat-container">
  <div ref="contents" class="chat-contents">
    <picker
      :data="emojiIndex"
      :emojiSize="20"
      @select="insert"
      :showPreview="false"
      v-show="emoji"
      />
  </div>
  <div class="chat-input">
  <v-text-field
    autofocus
    background-color="#424242"
    class="chat-input pa-0 pl-2 pr-2"
    flat
    hide-details
    id="chat-input"
    loader-height="0"
    :placeholder="state.name"
    prepend-inner-icon="mdi-chat"
    ref="input"
    v-model="input"
    @keypress.enter="submit"
    >
    <template v-slot:append>
      <v-icon @click.stop="emoji = !emoji">mdi-emoticon-happy-outline</v-icon>
    </template>
  </v-text-field>
  </div>
</div>
</template>

<script>
import state from '../state';
import data from 'emoji-mart-vue-fast/data/all.json';
import {
  Picker, EmojiIndex
} from 'emoji-mart-vue-fast';
import 'emoji-mart-vue-fast/css/emoji-mart.css';

export default {
  name: 'chat',
  props: { id: String },
  components: { Picker },
  data () {
    return {
      state,
      input: '',
      emoji: false,
      emojiIndex: new EmojiIndex(data)
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
    },
    insert (emoji) {
      console.log(emoji.native);
      this.input += emoji.native;
      this.emoji = false;
      this.$refs.input.focus();
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
    font-size: .875rem;
}
.chat-contents {
    position: relative;
    height: 326px !important;
    font-size: .875rem;
}
.chat-input {
    font-size: .875rem !important;
    background-color: #424242;
}
.emoji-mart {
    position: absolute;
    top: 26px;
    right: 0px;
    height: 300px !important;
}
</style>
