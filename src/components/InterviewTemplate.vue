<template>
<v-form>
  <v-container fluid>
    <v-row align="center" justify="center" class="title title-input">
      <v-col cols="12" md="4">
        <v-text-field single-line label="Title" width="300" v-model="title" class="title"></v-text-field>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" md="2"></v-col>
      <v-col cols="12" md="4">
        <v-text-field clearable prepend-icon="mdi-domain" label="Company" v-model="company" class="pr-3" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field clearable label="Position" v-model="position" class="pl-3" />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" md="2"></v-col>
      <v-col cols="12" md="3">
        <v-menu
          v-model="dateMenu"
          :close-on-content-click="false"
          max-width="290"
          >
          <template v-slot:activator="{ on }">
            <v-text-field
              :value="dateFormatted"
              label="Scheduled on"
              readonly
              v-on="on"
              prepend-icon="mdi-calendar"
            ></v-text-field>
          </template>
          <v-date-picker
            color="#0087af"
            v-model="date"
            @change="dateMenu = false"
            ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" md="2">
        <v-menu
        ref="menu"
        v-model="timeMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        :return-value.sync="time"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="time"
            prepend-icon="mdi-clock-outline"
            type="time"
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-if="timeMenu"
          v-model="time"
          color="#0087af"
          @click:minute="$refs.menu.save(time)"
        ></v-time-picker>
      </v-menu>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          color="#0087af"
          item-text="text"
          item-value="value"
          :items="durations"
          v-model="duration"
          prepend-icon="mdi-timer"
          >
        ></v-select>
      </v-col>
    </v-row>
    <v-row dense><v-col /></v-row>
    <v-row dense>
      <v-col cols="12" md="2"></v-col>
      <v-col cols="12" md="3" class="subtitle-1 font-weight-bold">
        <v-icon left>mdi-account-circle</v-icon> Interviewer
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" md="2"></v-col>
      <v-col cols="12" md="4" class="subtitle-2">
        <v-text-field clearable label="Name" v-model="interviewer.name" class="pr-3" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field clearable label="Email" v-model="interviewer.email" class="pl-3" />
      </v-col>
    </v-row>
    <v-row dense><v-col /></v-row>
    <v-row dense>
      <v-col cols="12" md="2"></v-col>
      <v-col cols="12" md="3" class="subtitle-1 font-weight-bold">
        <v-icon left>mdi-comment-account</v-icon> Candidate
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" md="2"></v-col>
      <v-col cols="12" md="4" class="subtitle-2">
        <v-text-field clearable label="Name" v-model="candidate.name" class="pr-3" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field clearable color="#009fcc" label="Email" v-model="candidate.email" class="pl-3" />
      </v-col>
    </v-row>
  </v-container>
</v-form>
</template>

<script>
import state from '../state';
import moment from 'moment';

export default {
  name: 'interview-template',
  data () {
    return {
      state,
      title: 'Interview',
      company: state.session.user.company || '',
      position: '',
      date: new Date().toISOString().
        substring(0, 10),
      dateMenu: false,
      time: '09:00',
      timeMenu: false,
      duration: 1,
      durations: [ {
        value: 0.5,
        text: '30 minutes'
      }, {
        value: 1,
        text: '1 hour'
      }, {
        value: 1.5,
        text: '1 hour 30 minutes'
      }, {
        value: 2,
        text: '2 hours'
      }, {
        value: 2.5,
        text: '2 hours 30 minutes'
      }, {
        value: 3,
        text: '3 hours'
      }, {
        value: 3.5,
        text: '3 hours 30 minutes'
      }, {
        value: 4,
        text: '4 hours'
      } ],
      interviewer: {
        name: state.session.user.name,
        email: state.session.user.email
      },
      candidate: {
        name: '',
        email: ''
      },
      users: [],
      image: 0,
      images: [ {
        id: 0,
        name: 'Development (default)',
        image: 'interrogative-container'
      } ],
      git: true,
      uploads: true,
      buttons: [],
      keypairs: []
    };
  },
  computed: { dateFormatted () {
    return this.date ? moment(this.date).format('dddd, MMMM Do YYYY') : '';
  } }
};
</script>

<style>
.title-input input {
    text-align: center;
}
</style>
