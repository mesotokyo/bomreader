// bomreader.js

// <song-list> component
const methods = {
  toggleSongProperties: function toggleSongProperties(song) {
    if (!song.songID) { return; }
    song.showProperties = !song.showProperties;
    if (!song.properties) {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('load', () => {
        if (xhr.status == 200) {
          this.$set(song, "properties", xhr.response);
        }
      });
      xhr.responseType = 'json';
      xhr.open('GET', '/song/' + this.$props.eventId + '/' + song.songID);
      xhr.send();
    }
  },
}

Vue.component('song-list', {
  data: function () { return {} },
  props: { queue: Object, eventId: String },
  template: '#song-list-template',
  methods: methods,
});


// view-model
function beforeCreate() {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => {
    if (xhr.status == 200) {
      this.approved = xhr.response.approved;
      this.queuing = xhr.response.queuing;
    }
  });
  xhr.responseType = 'json';
  xhr.open('GET', '/event/' + 'gmp9');
  xhr.send();
}


// data
const data = {
  approved: {},
  queuing: {},
  eventID: "gmp9",
};

// create view-model
const app = new Vue({
  el: '#main-frame',
  data: data,
  beforeCreate: beforeCreate,
});

