all: core images container manager templates emailer

core:
	docker build -f images/core/Dockerfile -t interrogative-core .

.PHONY: core images container manager emailer
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
