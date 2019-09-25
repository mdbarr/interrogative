all: pull core images container manager templates messanger

.PHONY: pull core images container manager messanger
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

messanger:
	docker build -f lib/messanger/Dockerfile -t interrogative-messanger .

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
	docker rmi interrogative-messanger
	docker rmi interrogative-manager
	docker rmi interrogative-mongo
	docker rmi interrogative-user
	docker system prune -f
