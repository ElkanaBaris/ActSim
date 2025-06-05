#!/bin/bash
set -e

docker build -t actsim .
docker run --rm -p 5000:5000 -e DATABASE_URL=$DATABASE_URL actsim
