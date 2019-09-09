<template>
<div class="chat-container">
  <div ref="contents" class="chat-contents" @click.stop="click">
    <picker
      :data="emojiIndex"
      :emojiSize="20"
      @select="insert"
      :showPreview="false"
      v-show="emoji"
      />
    <div v-for="message of state.messages" :key="message.id" :class="fromClass(message)">
      {{ message.text }}
    </div>
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
    click () {
      this.$refs.input.focus();
    },
    focus (event) {
      if (event.data.id === this.id) {
        this.$refs.input.focus();
      }
    },
    submit () {
      console.log('input', this.input);
      const message = {
        id: Date.now().toString(),
        user: this.state.messages.length % 2 ? this.state.user : 'them',
        text: this.input
      };
      this.state.messages.push(message);

      this.input = '';
    },
    insert (emoji) {
      console.log(emoji.native);
      this.input += emoji.native;
      this.emoji = false;
      this.$refs.input.focus();
    },
    fromClass (message) {
      if (message.user === this.state.user) {
        return 'message from-me';
      }
      return 'message from-them';
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
    display: flex;
    flex-direction: column;
    padding: 10px 20px;
    overflow: scroll;
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
    z-index: 100;
}
.message {
    display: inline-flex;
    width: fit-content;
    margin-bottom: 12px;
    line-height: 24px;
    position: relative;
    padding: 10px 20px;
    border-radius: 25px;
}
.message:before,.message:after {
    content:'';
    position: absolute;
    bottom: -2px;
    height: 20px;
}
.from-me {
    color: white;
    background: #0083af;
    align-self: flex-end;
}
.from-me:before {
    right: -7px;
    border-right: 20px solid #0083af;
    border-bottom-left-radius: 16px 14px;
    transform: translate(0, -2px);
}
.from-me:after {
    right: -56px;
    width: 26px;
    background: #222;
    border-bottom-left-radius: 10px;
    transform: translate(-30px, -2px);
}
.from-them {
    background: #585858;
    color: white;
}
.from-them:before {
    left: -7px;
    border-left: 20px solid #585858;
    border-bottom-right-radius: 16px 14px;
    transform: translate(0, -2px);
}
.from-them:after {
    left: 4px;
    width: 26px;
    background: #222;
    border-bottom-right-radius: 10px;
    transform: translate(-30px, -2px);
}
</style>
