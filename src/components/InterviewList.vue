<template>
  <div>
    <template v-if="heading">
      <v-row dense>
        <v-col
          md="10"
          class="font-weight-bold text-uppercase pl-5"
        >
          <v-icon
            left
            class="pr-2"
          >
            {{ icon }}
          </v-icon>{{ heading }}
        </v-col>
      </v-row>
    </template>
    <v-row dense>
      <v-col />
    </v-row>
    <v-row dense>
      <v-col />
    </v-row>
    <template v-if="title">
      <v-row dense>
        <v-col
          cols="12"
          md="1"
        />
        <v-col
          cols="12"
          md="3"
          class="subtitle-1 font-weight-bold"
        >
          <v-icon left>
            mdi-calendar-account
          </v-icon>
          {{ title }}
        </v-col>
      </v-row>
    </template>
    <v-row
      v-for="(interview, index) of filterLimit(interviews)"
      :key="interview.id"
      dense
    >
      <v-col
        cols="12"
        md="2"
      />
      <v-col
        cols="12"
        md="8"
      >
        <v-card :class="cardClass(interview)">
          <v-card-title class="subtitle-1 pr-0 pt-1">
            <span v-if="candidate(interview)">
              <v-icon
                left
                class="mr-2"
              >mdi-comment-account mdi-flip-h</v-icon>
              {{ interview.title }} for <span class="font-weight-bold pl-1 pr-1">{{ interview.position }}</span>
              <v-icon
                small
                class="ml-1"
              >mdi-at</v-icon><span class="company">{{ interview.company }}</span>
              with <span class="candidate font-weight-bold pl-1 pr-1"> {{ interviewers(interview.users) }}</span>
            </span>
            <span v-else>
              <v-icon
                left
                class="mr-2"
              >mdi-comment-account-outline</v-icon>
              {{ interview.title }}
              <span v-if="candidates(interview.users) && interview.position">
                <span class="candidate font-weight-bold pl-1 pr-1"> {{ candidates(interview.users) }}</span>
                for <span class="font-weight-bold pl-1 pr-1">{{ interview.position }}</span>
              </span>
              <v-icon
                small
                class="ml-1"
              >mdi-at</v-icon><span class="company">{{ interview.company }}</span>
            </span>
            <v-spacer v-if="!candidate(interview)" />
            <v-btn
              v-if="!candidate(interview)"
              icon
              class="mr-1"
            >
              <v-icon @click="expand(interview)">
                {{ chevron(interview) }}
              </v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="subtitle-1">
            <span>
              <v-icon
                left
                class="mr-2"
              >mdi-calendar</v-icon> {{ interview.start | calendar }} for
              {{ interview.duration | duration }}
            </span>
          </v-card-text>
          <v-card-text
            v-if="!candidate(interview)"
            class="pt-0 pb-0"
          >
            <v-expand-transition>
              <div
                v-show="expanded[interview.id]"
                class="pl-2"
              >
                <v-icon small>
                  mdi-account-multiple
                </v-icon><span class="pl-2 white--text">People</span>
                <v-list
                  dense
                  class="pa-0"
                >
                  <v-list-item
                    v-for="user in interview.users"
                    :key="user.id"
                  >
                    {{ user.name }} ({{ user.role | capitalize }})
                    <a
                      :href="'/interview/' + user.id "
                      class="interview-link pl-3"
                      target="_blank"
                    >
                      Interview Link <v-icon
                        small
                        color="#3491B5"
                      >mdi-open-in-new</v-icon>
                    </a>
                  </v-list-item>
                </v-list>
              </div>
            </v-expand-transition>
          </v-card-text>
          <v-card-actions>
            <v-dialog
              v-if="owner(interview) && upcoming"
              v-model="editing"
              width="800"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  color="#0087af"
                  class="mr-2"
                  v-on="on"
                >
                  Edit<v-icon
                    right
                    class="ml-3 mr-1"
                  >
                    mdi-pencil
                  </v-icon>
                </v-btn>
              </template>
              <EditInterview
                :interview="interview"
                @done="editing = false"
              />
            </v-dialog>
            <v-btn
              v-if="link(interview) && canOpen(interview)"
              color="#0087af"
              class="mr-2"
              :to="{ path: link(interview) }"
              target="_blank"
            >
              Open<v-icon
                right
                class="ml-3 mr-1"
              >
                mdi-launch
              </v-icon>
            </v-btn>
            <v-btn
              v-if="upcoming"
              color="#0087af"
              :href="email(interview)"
              target="_blank"
            >
              Email<v-icon
                right
                class="ml-3 mr-1"
              >
                mdi-email
              </v-icon>
            </v-btn>
            <v-spacer />
            <v-btn
              v-if="owner(interview) && upcoming"
              color="red"
            >
              Cancel<v-icon
                right
                class="ml-3 mr-1"
              >
                mdi-cancel
              </v-icon>
            </v-btn>
            <v-btn
              v-if="owner(interview) && !upcoming"
              color="red"
            >
              Delete<v-icon
                right
                class="ml-3 mr-1"
              >
                mdi-delete
              </v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
        <div
          v-if="last(index)"
          class="more-count"
        >
          <v-btn
            small
            text
            @click="more"
          >
            {{ remaining() | number }} more <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import state from '../state';
import EditInterview from '../components/EditInterview';

export default {
  name: 'InterviewList',
  components: { EditInterview },
  props: {
    title: String,
    heading: String,
    icon: String,
    limit: {
      type: Number,
      default: -1,
    },
    upcoming: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      state,
      interviews: [],
      expanded: {},
      interval: null,
      editing: false,
    };
  },
  mounted () {
    this.$events.on('notification:interview:created', this.list);

    this.list().
      then(() => {
        this.interval = setInterval(() => {
          // this.list();
        }, 10000);
      });
  },
  destroyed () {
    this.$events.off('notification:interview:created', this.list);
    clearInterval(this.interval);
  },
  methods: {
    who (users, role) {
      const who = [];
      for (const user of users) {
        if (user.role === role) {
          who.push(user.name);
        }
      }
      return who.join(', ');
    },
    candidates (users) {
      return this.who(users, 'candidate');
    },
    interviewers (users) {
      return this.who(users, 'interviewer');
    },
    me (interview) {
      for (const user of interview.users) {
        if (user.email === this.state.session.user.email) {
          return user;
        }
      }
      return false;
    },
    role (interview, value) {
      return this.me(interview).role === value;
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
    interviewer (interview) {
      return this.role(interview, 'interviewer');
    },
    candidate (interview) {
      return this.role(interview, 'candidate');
    },
    observer (interview) {
      return this.role(interview, 'observer');
    },
    canOpen (interview) {
      if (this.owner(interview) || this.interviewer(interview)) {
        return true;
      }

      const now = Date.now();
      if (interview.start >= now && interview.stop <= now) {
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
    last (index) {
      if (this.limit > 0 && index === this.limit - 1 &&
          this.interviews.length > this.limit) {
        return true;
      }
      return false;
    },
    remaining () {
      return this.interviews.length - this.limit;
    },
    more () {
      this.$emit('more');
    },
    cardClass (interview) {
      if (this.candidate(interview)) {
        return 'mb-3 card-candidate';
      }
      return 'mb-3';
    },
    expand (interview) {
      this.$set(this.expanded, interview.id, !this.expanded[interview.id]);
    },
    chevron (interview) {
      if (this.expanded[interview.id]) {
        return 'mdi-chevron-up';
      }
      return 'mdi-chevron-down';
    },
    list () {
      const url = this.upcoming ? '/interviews/upcoming' : '/interviews/past';
      return this.$api.get(url).
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
              data: error.message || 'Failed to fetch Interviews',
            },
          });
        });
    },
  },
};
</script>

<style>
.candidate {}
.position {}

.company {
  color: #009fcc;
  font-weight: 700;
}

.more-count {
  text-align: right;
  font-size: 12px;
}

.card-candidate {
  border-left: 6px solid #3491b5 !important;
}

.interview-link {
  color: #3491b5 !important;
  text-decoration: none;
  font-weight: 700;
}
</style>
