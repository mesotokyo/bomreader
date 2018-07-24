// bomreader.js

const data = {
  approved: {},
  queuing: {},
  eventID: "LLBS23",
};
function beforeCreate() {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => {
    if (xhr.status == 200) {
      this.approved = xhr.response.approved;
      this.queuing = xhr.response.queuing;
    }
  });
  xhr.responseType = 'json';
  xhr.open('GET', 'test_event.json');
  xhr.send();
}

const app = new Vue({
  el: '#main-frame',
  data: data,
  beforeCreate: beforeCreate,
});

