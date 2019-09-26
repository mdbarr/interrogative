all: pull core images container manager templates messenger

.PHONY: pull core images container manager messenger
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

messenger:
	docker build -f lib/messenger/Dockerfile -t interrogative-messenger .

templates:
	$(MAKE) -C templates

clean:
	$(MAKE) -C templates clean
	./bin/kill.sh
	docker system prune -f
	docker volume prune -f

spotless:
	docker rmi interrogative-base
	docker rmi interrogative-container
	docker rmi interrogative-core
	docker rmi interrogative-messenger
	docker rmi interrogative-manager
	docker rmi interrogative-mongo
	docker rmi interrogative-user
	docker system prune -f

rebuild:
	yarn lint
	yarn api:lint
	make clean
	make all
