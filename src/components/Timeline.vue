<template>
<div>
  <v-timeline dense align-top class="timeline-margin">
    <v-timeline-item v-for="item of state.timeline" color="#0087af" :key="item.id" :icon="item.icon" right small fill-dot>
      <div class="timeline-description">
        {{ item.description }}
      </div>
      <div class="timeline-timestamp">
        {{ item.timestamp | calendar }}
      </div>
    </v-timeline-item>
  </v-timeline>
</div>
</template>

<script>
import state from '../state';

export default {
  name: 'timeline',
  data () {
    return { state };
  },
  methods: {}
};
</script>

<style>
.timeline-margin {
    margin-left: -24px !important;
}
.timeline-description {
    font-size: 11px !important;
}
.timeline-timestamp {
    font-size: 10px !important;
    color: #959595;
}
</style>
