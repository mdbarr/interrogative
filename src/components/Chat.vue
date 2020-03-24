<template>
  <div class="chat-container">
    <div
      ref="contents"
      class="chat-contents"
      @click.stop="click"
    >
      <template v-for="(message, index) of state.messages">
        <div
          v-if="fromWhom(message, index)"
          :key="message.id + '-name'"
          class="from-whom"
        >
          <v-icon
            small
            color="#585858"
            class="pr-1"
          >
            mdi-comment-account
          </v-icon>{{ message.name }}
        </div>
        <div
          :key="message.id"
          :class="fromClass(message)"
        >
          {{ message.text }}
        </div>
      </template>
    </div>
    <div class="chat-input">
      <v-text-field
        id="chat-input"
        ref="input"
        v-model="input"
        autofocus
        background-color="#424242"
        autocomplete="off"
        class="chat-input pa-0 pl-2 pr-2"
        flat
        hide-details
        loader-height="0"
        :placeholder="state.name"
        prepend-inner-icon="mdi-chat"
        @keypress.enter="submit"
      >
        <template v-slot:append>
          <v-icon @click.stop="emoji = !emoji">
            mdi-emoticon-happy-outline
          </v-icon>
        </template>
      </v-text-field>
    </div>
    <Picker
      v-show="emoji"
      :data="emojiIndex"
      :emoji-size="20"
      :show-preview="false"
      @select="insert"
    />
  </div>
</template>

<script>
import state from '../state';
import uuid from 'uuid/v4';
import data from 'emoji-mart-vue-fast/data/all.json';
import {
  Picker, EmojiIndex,
} from 'emoji-mart-vue-fast';
import 'emoji-mart-vue-fast/css/emoji-mart.css';

export default {
  name: 'Chat',
  components: { Picker },
  props: { id: String },
  data () {
    return {
      state,
      input: '',
      emoji: false,
      emojiIndex: new EmojiIndex(data),
    };
  },
  computed: { count () {
    return this.state.messages.length;
  } },
  watch: { count (value) {
    this.$nextTick(() => {
      this.$refs.contents.scrollTop = this.$refs.contents.scrollHeight;
    });
  } },
  mounted () {
    this.$events.on('terminal:tab:focus', this.focus);
  },
  destroyed () {
    this.$events.off('terminal:tab:focus', this.focus);
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
      if (this.input) {
        const message = {
          id: uuid(),
          name: this.state.name,
          user: this.state.user,
          text: this.input,
          timestamp: Date.now(),
        };

        this.input = '';

        this.$events.emit({
          type: 'messages:message:send',
          data: message,
        });
      }
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
    },
    fromWhom (message, index) {
      console.log('from whom', index, message);
      if (message.user === this.state.user) {
        return false;
      }
      for (let i = index - 1; i >= 0; i--) {
        if (this.state.messages[i].user === this.state.user) {
          continue;
        } else if (this.state.messages[i].user !== message.user) {
          return true;
        } else if (this.state.messages[i].user === message.user) {
          return false;
        } else {
          return true;
        }
      }
      return true;
    },
  },
};
</script>

<style>
.chat-container {
  height: 360px !important;
  width: 100%;
  background-color: #222;
  font-size: 0.875rem;
}

.chat-contents {
  position: relative;
  height: 326px !important;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  overflow-x: hidden;
  overflow-y: scroll;
}

.chat-input {
  font-size: 0.875rem !important;
  background-color: #424242;
}

.emoji-mart {
  position: fixed;
  bottom: 55px;
  right: 5px;
  height: 300px !important;
  z-index: 100;
}

.message {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 12px;
  line-height: 18px;
  position: relative;
  padding: 10px 20px;
  border-radius: 25px;
}

.message::before,
.message::after {
  content: '';
  position: absolute;
  bottom: -2px;
  height: 20px;
}

.from-me {
  color: white;
  background: #0087af;
  align-self: flex-end;
}

.from-me::before {
  right: -7px;
  border-right: 20px solid #0087af;
  border-bottom-left-radius: 16px 14px;
  transform: translate(0, -2px);
}

.from-me::after {
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

.from-them::before {
  left: -7px;
  border-left: 20px solid #585858;
  border-bottom-right-radius: 16px 14px;
  transform: translate(0, -2px);
}

.from-them::after {
  left: 4px;
  width: 26px;
  background: #222;
  border-bottom-right-radius: 10px;
  transform: translate(-30px, -2px);
}

.from-whom {
  position: relative;
  padding-bottom: 4px;
  font-size: 11px;
  left: -10px;
  color: #aaa;
}
</style>
