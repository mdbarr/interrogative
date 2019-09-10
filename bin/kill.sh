#!/bin/bash

docker ps --filter "network=interrogative" \
       --filter "network=interrogative-db" \
       --format "{{.ID}}" | xargs -r docker kill
exit 0
