g<template>
<div>
  <v-row dense><v-col /></v-row>
  <v-row dense><v-col /></v-row>
  <v-row dense>
      <v-col cols="12" md="1"></v-col>
      <v-col cols="12" md="3" class="subtitle-1 font-weight-bold">
        <v-icon left>mdi-calendar-account</v-icon>
        Upcoming Interviews
      </v-col>
  </v-row>
  <v-row dense v-for="interview of interviews" :key="interview.id">
    <v-col cols="12" md="2"></v-col>
    <v-col cols="12" md="8">
      <v-card>
        <v-card-title class="subtitle-1 pr-0 pt-1">
          <v-icon left class="mr-2">mdi-comment-account-outline</v-icon>
          {{ interview.title }}:&nbsp; <span class="candidate">{{ candidates(interview.users) }}</span>
          for {{ interview.position }}
          <v-icon small class="ml-1">mdi-at</v-icon><span class="company">{{ interview.company }}</span>
          <v-spacer />
          <v-icon class="mr-2">mdi-calendar</v-icon> {{ interview.start | calendar }}
          <v-spacer />
          <v-btn icon class="mr-1"><v-icon>mdi-chevron-down</v-icon></v-btn>
        </v-card-title>
        <v-card-actions>
          <v-btn color="#0087af" class="mr-2">Edit</v-btn>
          <v-btn color="#0087af" class="mr-2">Launch</v-btn>
          <v-btn color="#0087af">Email</v-btn>
          <v-spacer />
          <v-btn color="red">Delete<v-icon right class="pl-3">mdi-delete</v-icon></v-btn>
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
  name: 'upcoming',
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
    list () {
      this.$api.get('/interviews/upcoming').
        then((response) => {
          console.log('upcoming', response);
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
    this.list();
  }
};
</script>

<style>
.candidate {

}
.company {
    color: #009fcc;
    font-weight: 700;
}
</style>
