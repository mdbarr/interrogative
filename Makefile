all: core images container manager

core:
	docker build -f images/core/Dockerfile -t interrogative-core .

.PHONY: core images container manager
images:
	$(MAKE) -C images

container:
	docker build -f lib/container/Dockerfile -t interrogative-container .

manager:
	docker build -f lib/manager/Dockerfile -t interrogative-manager .

clean:
	./bin/kill.sh
	docker system prune -f
	docker volume prune -f
