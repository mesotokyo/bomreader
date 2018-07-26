// bomreader.js

// <song-list> component
const songListMethods = {
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
  methods: songListMethods,
});


// view-model

// data
const data = {
  approved: {},
  queuing: {},
  eventId: "",
};

// method
const methods = {
  loadEvent: loadEvent,
}

function loadEvent() {
  // parse URL
  const m = /^https?:\/\/bandoff.info\/(.*)\/?$/.exec(this.eventId);
  if (m) {
    this.eventId = m[1];
  }
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => {
    if (xhr.status == 200) {
      this.approved = xhr.response.approved;
      this.queuing = xhr.response.queuing;
    }
  });
  xhr.responseType = 'json';
  xhr.open('GET', '/event/' + this.eventId);
  xhr.send();
}

// create view-model
const app = new Vue({
  el: '#main-frame',
  data: data,
  methods: methods,
});

