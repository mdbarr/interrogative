<template>
  <v-timeline
    dense
    align-top
    class="timeline-margin"
  >
    <v-timeline-item
      v-for="item of state.timeline"
      :key="item.id"
      :color="item.color"
      :icon="item.icon"
      fill-dot
      right
      small
    >
      <div class="timeline-description">
        {{ item.description }}
      </div>
      <div class="timeline-timestamp">
        {{ item.timestamp | calendar }}
      </div>
    </v-timeline-item>
  </v-timeline>
</template>

<script>
import state from '../state';

export default {
  name: 'Timeline',
  data () {
    return { state };
  },
  methods: {},
};
</script>

<style>
.mdi-interrogative::before {
  background-image: url(../assets/logo.svg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 16px 16px !important;
  content: '';
  height: 16px !important;
  margin-top: -2px;
  position: relative;
  width: 16px !important;
}

.timeline-margin {
  margin-left: -24px !important;
}

.timeline-description {
  font-size: 11px !important;
  width: 192px !important;
}

.timeline-timestamp {
  color: #959595;
  font-size: 10px !important;
  width: 192px !important;
}
</style>
