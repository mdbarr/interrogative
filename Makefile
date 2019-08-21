all: yarn images container

yarn:
	yarn install

.PHONY: images container
images:
	$(MAKE) -C images

container:
	docker build -f lib/container/Dockerfile -t interrogative-container .
