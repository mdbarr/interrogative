g<template>
<div>
  <template v-if="heading">
    <v-row dense>
      <v-col md="6" class="font-weight-bold text-uppercase pl-5">
        <v-icon left class="pr-2">{{ icon }}</v-icon>{{ heading }}
      </v-col>
    </v-row>
  </template>
  <v-row dense><v-col /></v-row>
  <v-row dense><v-col /></v-row>
  <template v-if="title">
    <v-row dense>
      <v-col cols="12" md="1"></v-col>
      <v-col cols="12" md="3" class="subtitle-1 font-weight-bold">
        <v-icon left>mdi-calendar-account</v-icon>
        {{ title }}
      </v-col>
    </v-row>
  </template>
  <v-row dense v-for="interview of filterLimit(interviews)" :key="interview.id">
    <v-col cols="12" md="2"></v-col>
    <v-col cols="12" md="8">
      <v-card class="mb-3">
        <v-card-title class="subtitle-1 pr-0 pt-1">
          <v-icon left class="mr-2">mdi-comment-account-outline</v-icon>
          {{ interview.title }}:
          <span class="candidate font-weight-bold pl-1 pr-1"> {{ candidates(interview.users) }}</span>
          for <span class="font-italic pl-1 pr-1">{{ interview.position }}</span>
          <v-icon small class="ml-1">mdi-at</v-icon><span class="company">{{ interview.company }}</span>
          <v-spacer />
          <v-icon class="mr-2">mdi-calendar</v-icon> {{ interview.start | calendar }}
          <v-spacer />
          <v-btn v-if="owner(interview)" icon class="mr-1"><v-icon>mdi-chevron-down</v-icon></v-btn>
        </v-card-title>
        <v-card-actions>
          <v-btn v-if="owner(interview) && upcoming" color="#0087af" class="mr-2">Edit<v-icon right class="ml-3 mr-1">mdi-pencil</v-icon></v-btn>
          <v-btn v-if="link(interview)" color="#0087af" class="mr-2" :to="{ path: link(interview) }" target="_blank">
            Open<v-icon right class="ml-3 mr-1">mdi-launch</v-icon></v-btn>
          <v-btn v-if="upcoming" color="#0087af" :href="email(interview)" target="_blank">
            Email<v-icon right class="ml-3 mr-1">mdi-email</v-icon></v-btn>
          <v-spacer />
          <v-btn v-if="owner(interview) && upcoming" color="red">Cancel<v-icon right class="ml-3 mr-1">mdi-cancel</v-icon></v-btn>
          <v-btn v-if="owner(interview) && !upcoming" color="red">Delete<v-icon right class="ml-3 mr-1">mdi-delete</v-icon></v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</div>
</template>

<script>
import state from '../state';
import moment from 'moment';

export default {
  name: 'interview-list',
  props: {
    title: String,
    heading: String,
    icon: String,
    limit: {
      type: Number,
      default: -1
    },
    upcoming: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      state,
      interviews: []
    };
  },
  filters: { calendar (value) {
    return moment(value || undefined).calendar();
  } },
  methods: {
    candidates (users) {
      const candidates = [];
      for (const user of users) {
        if (user.role === 'candidate') {
          candidates.push(user.name);
        }
      }
      return candidates.join(', ');
    },
    me (interview) {
      for (const user of interview.users) {
        if (user.email === this.state.session.user.email) {
          return user;
        }
      }
      return false;
    },
    email (interview) {
      return `mailto:${ interview.id }@interrogative.io`;
    },
    link (interview) {
      if (this.me(interview)) {
        return `/interview/${ this.me(interview).id }`;
      }
      return false;
    },
    owner (interview) {
      if (this.state.session.user.id === interview.owner) {
        return true;
      }
      return false;
    },
    filterLimit (items) {
      if (this.limit > 0) {
        return items.slice(0, this.limit);
      }
      return items;
    },
    list () {
      const url = this.upcoming ? '/interviews/upcoming' : '/interviews/past';
      this.$api.get(url).
        then((response) => {
          if (response.data && response.data.items) {
            this.interviews.splice(0, this.interviews.length, ...response.data.items);
          }
        }).
        catch((error) => {
          this.$events.emit({
            type: 'notification:list-interviews:failed',
            data: {
              level: 'failure',
              data: error.message || 'Failed to fetch Interviews'
            }
          });
        });
    }
  },
  mounted () {
    this.$events.on('notification:interview:created', this.list);

    this.list();
  },
  destroyed () {
    this.$events.off('notification:interview:created', this.list);
  }
};
</script>

<style>
.candidate {}
.position {}
.company {
    color: #009fcc;
    font-weight: 700;
}
</style>
