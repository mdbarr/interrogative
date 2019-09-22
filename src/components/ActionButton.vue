<template>
<v-btn v-if="show" icon tile height="40" @click="click">
  <v-icon>mdi-{{ action.icon }}</v-icon>
</v-btn>
</template>

<script>
import state from '../state';

export default {
  name: 'action-button',
  props: { action: Object },
  data () {
    return {
      state,
      focus: '',
      name: '',
      extension: '',
      matcher: null,
      show: false
    };
  },
  methods: {
    focused (event) {
      this.focus = event.data.path;
      this.name = this.focus.replace(/^.*\/([^/]+)$/, '$1');
      this.extension = this.name.replace(/^.*\.([^.]+)$/, '$1');

      if (this.matcher) {
        if (this.action.filter === 'ext') {
          this.show = this.matcher.test(this.extension);
        } else if (this.action.filter === 'name') {
          this.show = this.matcher.test(this.name);
        }
        console.log('action', this.show);
      }
    },
    click () {
      this.$events.emit({
        type: 'terminal:tab:open',
        data: this.action
      });
    }
  },
  mounted () {
    console.log('button', this.matcher, this.action.match);
    if (!this.matcher && this.action.match) {
      const matcher = this.action.match.
        split(/[\s,]+/).
        map((item) => {
          item = item.replace(/\*/g, '.*');
          return `(${ item })`;
        }).
        join('|');

      this.matcher = new RegExp(`^${ matcher }$`);
    }

    if (this.action.scope === 'tab') {
      this.$events.on('editor:tab:focus', this.focused);
    }
  },
  destroyed () {
    if (this.action.scope === 'tab') {
      this.$events.off('editor:tab:focus', this.focused);
    }
  }
};
</script>

<style>

</style>
