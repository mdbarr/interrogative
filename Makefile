all: pull core images container manager templates emailer

.PHONY: pull core images container manager emailer
pull:
	docker pull mongo:4.2
	docker pull node:10
	docker pull node:10-alpine

core:
	docker build -f images/core/Dockerfile -t interrogative-core .

images:
	$(MAKE) -C images

container:
	docker build -f lib/container/Dockerfile -t interrogative-container .

manager:
	docker build -f lib/manager/Dockerfile -t interrogative-manager .

emailer:
	docker build -f lib/emailer/Dockerfile -t interrogative-emailer .

templates:
	$(MAKE) -C templates

clean:
	$(MAKE) -C templates clean
	./bin/kill.sh
	docker system prune -f
	docker volume prune -f
