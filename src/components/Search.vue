<template>
<div class="search-form pt-1">
  <v-text-field
    autofocus
    class="search-form pt-0"
    clearable
    @focus="$event.target.select()"
    height="26"
    :loading="loading"
    @keyup.enter="submit"
    prepend-icon="mdi-magnify"
    ref="input"
    v-model="search"
    ></v-text-field>
  <v-list dense>
    <v-list-item v-for="result of results" :key="result.path" @click="open(result)">
      <v-icon :color="result.color" class="pr-2">{{ result.icon }}</v-icon>
      <span class="subtitle-2">{{ result.name }}</span>
    </v-list-item>
  </v-list>
</div>
</template>

<script>
import state from '../state';
export default {
  name: 'search',
  props: {
    tab: Number,
    id: Number
  },
  data () {
    return {
      state,
      search: '',
      results: [],
      loading: false,
      url: `${ window.location.origin }/api${ window.location.pathname }/search`
    };
  },
  methods: {
    open (item) {
      if (this.state.files[item.path]) {
        this.$events.emit({
          type: 'editor:tab:focus',
          data: { path: item.path }
        });
      } else {
        this.$events.emit({
          type: 'files:file:open',
          data: { path: item.path }
        });
      }
    },
    submit () {
      if (this.search) {
        this.loading = true;
        this.$api.post(this.url, { pattern: this.search }).then((response) => {
          this.results.splice(0, this.results.length, ...response.data);
          this.loading = false;
        });
      }
    }
  },
  watch: { tab (value) {
    if (value === this.id) {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.$refs.input.focus();
        });
      });
    }
  } }
};
</script>

<style>
.search-form {
    font-size: 14px !important;
}
.search-form .v-input__prepend-outer {
    font-size: 14px !important;
}
.search-form .v-input__icon {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
}
.search-form .v-icon {
    font-size: 20px;
}
.search-form .v-label {
    font-size: 14px !important;
}
</style>
