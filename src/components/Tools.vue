<template>
  <div class="tools pl-4">
    <v-btn
      small
      @click="clearOpenFiles"
    >
      <v-icon
        small
        left
      >
        mdi-file
      </v-icon> Clear Open Files
    </v-btn><br>
    <v-btn
      small
      @click="clearUploadsList"
    >
      <v-icon
        small
        left
      >
        mdi-cloud-upload
      </v-icon>
      Clear Uploads List
    </v-btn><br>
    <v-btn
      small
      @click="clearChatHistory"
    >
      <v-icon
        small
        left
      >
        mdi-forum
      </v-icon>
      Clear Chat History
    </v-btn><br>
    <v-btn
      v-if="endable"
      small
      color="red"
      class="mt-9"
      @click="endInterview"
    >
      <v-icon
        small
        left
      >
        mdi-phone-hangup
      </v-icon>End Interview
    </v-btn>
  </div>
</template>

<script>
import state from '../state';

export default {
  name: 'Tools',
  data () {
    return { state };
  },
  computed: { endable () {
    if (this.state.interview.start >= Date.now() && this.state.interview.stop <= Date.now()) {
      return true;
    }

    for (const id in this.state.online) {
      if (this.state.online[id].role === 'candidate') {
        return true;
      }
    }

    return false;
  } },
  methods: {
    clearOpenFiles () {
      this.$events.emit({
        type: 'tools:files:clear-open',
        data: { auth: this.state.user }
      });
    },
    clearUploadsList () {
      this.$events.emit({
        type: 'tools:files:clear-uploads',
        data: { auth: this.state.user }
      });
    },
    clearChatHistory () {
      this.$events.emit({
        type: 'tools:messages:clear',
        data: { auth: this.state.user }
      });
    },
    endInterview () {
      this.$events.emit({
        type: 'tools:interview:end',
        data: { auth: this.state.user },
        scope: { role: 'candidate' }
      });
    }
  }
};
</script>

<style>
.tools {
    line-height: 50px;
}
</style>
