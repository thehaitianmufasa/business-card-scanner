#!/bin/bash
cd "$(dirname "$0")"
# Start the server in the background if not already running
if ! lsof -i:3000 | grep LISTEN; then
  nohup node server.js > server.log 2>&1 &
  sleep 2
fi
open http://localhost:3000 