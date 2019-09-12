<template>
<v-form ref="form">
  <v-container fluid class="pt-0">
    <v-row dense>
      <v-col md="6" class="font-weight-bold text-uppercase pl-5">
        <v-icon left class="pr-2">mdi-calendar-plus</v-icon>Schedule a new Interview
      </v-col>
    </v-row>
    <v-row align="center" justify="center" class="title title-input">
      <v-col cols="12" md="4">
        <v-text-field single-line label="Title" width="300" v-model="title" class="title" autofocus></v-text-field>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" md="2"></v-col>
      <v-col cols="12" md="4">
        <v-text-field clearable prepend-icon="mdi-office-builder" label="Company" :rules="[ validateCompany ]" v-model="company" class="pr-3" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field clearable label="Position" :rules="[ validatePosition ]" v-model="position" class="pl-3" />
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
        <v-text-field clearable label="Name" v-model="interviewer.name" :rules="[ validateName ]" class="pr-3" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field clearable label="Email" type="email" :rules="[ validateEmail ]" v-model="interviewer.email" class="pl-3" />
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
        <v-text-field clearable label="Name" v-model="candidate.name"  :rules="[ validateName ]" class="pr-3" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field clearable color="#009fcc" label="Email" type="email" :rules="[ validateEmail ]" v-model="candidate.email" class="pl-3" />
      </v-col>
    </v-row>
    <v-row><v-col /></v-row>
    <v-row dense>
      <v-col cols="12" md="2"></v-col>
      <v-col cols="12" md="3" class="subtitle-1 font-weight-bold">
        <v-icon left>mdi-laptop-windows</v-icon> Environment
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" md="2"></v-col>
      <v-col cols="12" md="4">
        <v-select
          color="#0087af"
          item-text="name"
          item-value="index"
          :items="images"
          v-model="image"
          class="pr-3" />
      </v-col>
      <v-col cols="12" md="4" class="pl-3">
        <v-checkbox
          v-model="images[image].git"
          label="Enable Git Visualization"
          color="#009fcc"
          class="mt-0 pt-0"
          :disabled="!images[image].hasGit"
          ></v-checkbox>
        <v-checkbox
          v-model="images[image].uploads"
          label="Enable Uploads"
          color="#009fcc"
          class="mt-0 pt-0"
          :disabled="!images[image].hasUploads"
          ></v-checkbox>
      </v-col>
    </v-row>
    <v-row><v-col /></v-row>
    <v-row><v-col /></v-row>
    <v-row dense>
      <v-col cols="12" md="2"></v-col>
      <v-col cols="12" md="4" class="subtitle-1 font-weight-bold">
        <v-btn color="grey" @click="reset" right>Clear</v-btn>
      </v-col>
      <v-col cols="12" md="4" class="subtitle-1 font-weight-bold" align="right" justify="right">
        <v-btn color="#009fcc" @click="submit" right :loading="loading" :disabled="loading">Create</v-btn>
      </v-col>
    </v-row>
  </v-container>
</v-form>
</template>

<script>
import state from '../state';
import moment from 'moment';
import { milliseconds } from 'barrkeep/utils';

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
      duration: '1h',
      durations: [ {
        value: '30m',
        text: '30 minutes'
      }, {
        value: '1h',
        text: '1 hour'
      }, {
        value: '1h 30m',
        text: '1 hour 30 minutes'
      }, {
        value: '2h',
        text: '2 hours'
      }, {
        value: '2h 30m',
        text: '2 hours 30 minutes'
      }, {
        value: '3h',
        text: '3 hours'
      }, {
        value: '3h 30m',
        text: '3 hours 30 minutes'
      }, {
        value: '4h',
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
        index: 0,
        name: 'Development (default)',
        image: 'interrogative-container',
        hasGit: true,
        hasUploads: true,
        git: true,
        uploads: true
      } ],
      git: true,
      uploads: true,
      buttons: [],
      keypairs: [],
      loading: false
    };
  },
  computed: { dateFormatted () {
    return this.date ? moment(this.date).format('dddd, MMMM Do YYYY') : '';
  } },
  methods: {
    validateEmail (value = '') {
      if (!value.includes('@') && value !== 'administrator') {
        return 'Please enter a valid email address';
      }
      return true;
    },
    validateName (value) {
      if (!value) {
        return 'Please enter a name';
      }
      return true;
    },
    validateCompany (value) {
      if (!value) {
        return 'Please enter a company name';
      }
      return true;
    },
    validatePosition (value) {
      if (!value) {
        return 'Please enter a position';
      }
      return true;
    },
    reset () {
      this.$refs.form.resetValidation();

      this.title = 'Interview';
      this.company = state.session.user.company || '';
      this.position = '';
      this.date = new Date().toISOString().
        substring(0, 10);
      this.time = '09:00';
      this.duration = '1h';
      this.interviewer.name = state.session.user.name;
      this.interviewer.email = state.session.user.email;
      this.candidate.name = '';
      this.candidate.email = '';
      this.users.splice(0, this.users.length);
      this.image = 0;
    },
    submit () {
      if (this.$refs.form.validate()) {
        this.loading = true;

        const body = {
          start: new Date(`${ this.date } ${ this.time }`).getTime(),
          duration: milliseconds(this.duration),
          title: this.title,
          company: this.company,
          position: this.positions,
          users: [ {
            name: this.interviewer.name,
            email: this.interviewer.email,
            role: 'interviewer'
          }, {
            name: this.candidate.name,
            email: this.candidate.email,
            role: 'candidate'
          }, ...this.users ],
          image: this.images[this.image].image,
          git: this.images[this.image].git,
          uploads: this.images[this.image].uploads,
          buttons: this.buttons
        };

        this.$api.post('/interviews/create', body).
          then((response) => {
            console.log(response.data);
            this.$events.emit({
              type: 'notification:interview:created',
              data: {
                level: 'success',
                message: 'Interview scheduled!'
              }
            });
            this.loading = false;
            this.reset();
          }).
          catch((error) => {
            this.$events.emit({
              type: 'notification:interview:failed',
              data: {
                level: 'failure',
                message: `Failed to create interview: ${ error.message }`
              }
            });
            this.loading = false;
          });
      }
    }
  },
  mounted () {
    this.reset();
  }
};
</script>

<style>
.title-input input {
    text-align: center;
}
</style>
