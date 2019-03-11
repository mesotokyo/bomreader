// bomreader.js

// <song-list> component
const songListMethods = {
  toggleSongProperties: function toggleSongProperties(song) {
    if (!song.songID) { return; }
    if (song.showProperties === undefined) {
      this.$set(song, "showProperties", true);
    } else {
      song.showProperties = !song.showProperties;
    }
    if (song.loading === undefined) {
      this.$set(song, "loading", true);
    }

    if (!song.properties) {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('load', () => {
        if (xhr.status == 200) {
          this.$set(song, "properties", xhr.response);
          song.loading = false;
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
  status: false,
};

// method
const methods = {
  loadEvent: loadEvent,
}

function loadEvent() {
  // parse URL
  if (this.eventId.length == 0) {
    return;
  }

  const m = /^https?:\/\/bandoff.info\/(.*)\/?$/.exec(this.eventId);
  if (m) {
    this.eventId = m[1];
  }
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => {
    if (xhr.status == 200) {
      this.approved = xhr.response.approved;
      this.queuing = xhr.response.queuing;
      this.status = "loaded";
    } else if (xhr.status == 404) {
      this.status = "not_found";
    } else {
      this.status = "error";
    }
  });
  xhr.responseType = 'json';
  xhr.open('GET', '/event/' + this.eventId);
  xhr.send();

  // update URL bar
  history.replaceState('', '', this.eventId);
  this.status = "loading";
}

function created() {
  // get event id from url
  const pathname = location.pathname.substring(1).trim();
  if (pathname.length > 0 && pathname.search('/') == -1) {
    this.eventId = pathname;
    this.loadEvent();
  }
}

// create view-model
const app = new Vue({
  el: '#main-frame',
  data: data,
  methods: methods,
  created: created,
});

