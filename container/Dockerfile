FROM node:10

COPY files/bomreader /var/bomreader
RUN cd /var/bomreader; npm install

EXPOSE 1080/tcp
CMD ["/var/bomreader/server.js"]

