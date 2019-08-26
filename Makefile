all: yarn images container manager

yarn:
	yarn install

.PHONY: images container manager
images:
	$(MAKE) -C images

container:
	docker build -f lib/container/Dockerfile -t interrogative-container .

manager:
	docker build -f lib/manager/Dockerfile -t interrogative-manager .
