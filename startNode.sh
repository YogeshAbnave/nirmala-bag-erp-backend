#!/bin/bash
/var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/node_modules/forever/bin/forever start -o out.log -e err.log --minUptime 1000 --spinSleepTime 1000 app.js