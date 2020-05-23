all: pull core images container manager templates messenger

.PHONY: pull core images container manager templates messenger backup rebuild

pull:
	docker pull mongo:4.2
	docker pull node:12
	docker pull node:12-alpine
	docker pull ubuntu:bionic

core:
	docker build -f images/core/Dockerfile -t interrogative-core .

images:
	$(MAKE) -C images

container:
	docker build -f lib/container/Dockerfile -t interrogative-container .

manager:
	docker build -f lib/manager/Dockerfile -t interrogative-manager .

messenger: templates
	docker build -f lib/messenger/Dockerfile -t interrogative-messenger .

templates:
	$(MAKE) -C templates

clean:
	$(MAKE) -C templates clean
	./bin/kill.sh
	docker system prune -f
	docker volume prune -f

backup:
	mkdir -p backups
	docker run --rm -v interrogative-data:/data/db -v $(PWD)/backups:/backup ubuntu:bionic tar czvf /backup/backup-$(shell date --rfc-3339=date).tar.gz /data/db

spotless:
	docker rmi interrogative-base \
	interrogative-container \
	interrogative-core \
	interrogative-messenger \
	interrogative-manager \
	interrogative-mongo \
	interrogative-user || true
	docker system prune -f

rebuild:
	yarn lint
	yarn lint:api
	yarn lint:style
	make clean
	make all

redeploy:
	make
	docker-compose down
	docker system prune -f
	docker-compose up -d
	sleep 15
	sudo systemctl restart nginx || true
