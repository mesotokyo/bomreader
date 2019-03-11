#!/bin/bash
SESSION_ID=$1
SONG_ID=$2
DOWNLOADER="curl -o"

$DOWNLOADER test.html http://bandoff.info/$SESSION_ID/
$DOWNLOADER song_sample.html http://bandoff.info/$SESSION_ID/song/$SONG_ID
