<template>
  <div class="search-form pt-1">
    <v-text-field
      ref="input"
      v-model="search"
      autofocus
      class="search-form pt-0 pr-4"
      clearable
      height="26"
      :loading="loading"
      prepend-icon="mdi-magnify"
      @focus="$event.target.select()"
      @keyup.enter="submit"
    />
    <v-list dense>
      <v-list-item
        v-for="result of results"
        :key="result.path"
        @click="open(result)"
      >
        <v-icon
          :color="result.color"
          class="pr-2"
        >
          {{ result.icon }}
        </v-icon>
        <span class="subtitle-2">{{ result.name }}</span>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import state from '../state';
export default {
  name: 'Search',
  props: {
    tab: {
      type: Number,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
  },
  data () {
    return {
      state,
      search: '',
      results: [],
      loading: false,
      url: `${ window.location.origin }/api${ window.location.pathname }/search`,
    };
  },
  watch: {
    tab (value) {
      if (value === this.id) {
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.$refs.input.focus();
          });
        });
      }
    },
  },
  methods: {
    open (item) {
      if (this.state.files[item.path]) {
        this.$events.emit({
          type: 'editor:tab:focus',
          data: { path: item.path },
        });
      } else {
        this.$events.emit({
          type: 'files:file:open',
          data: { path: item.path },
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
    },
  },
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
  height: 20px;
  min-height: 20px;
  min-width: 20px;
  width: 20px;
}

.search-form .v-icon {
  font-size: 20px;
}

.search-form .v-label {
  font-size: 14px !important;
}
</style>
