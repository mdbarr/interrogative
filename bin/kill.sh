#!/bin/bash

docker ps --filter "network=interrogative" --format "{{.ID}}" | xargs docker kill || true
