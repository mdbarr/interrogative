all: yarn images

yarn:
	yarn install

.PHONY: images
images:
	$(MAKE) -C images
