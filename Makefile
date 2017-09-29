ifeq ($(DOCKER_ARCH),armhf)
	DOCKER_IMAGE_NAME := tenstartups/dsc-smartthings-server:armhf
else
	DOCKER_ARCH := x64
	DOCKER_IMAGE_NAME := tenstartups/dsc-smartthings-server:latest
endif
IP_ADDRESS := $(shell ipconfig getifaddr en0)

build: Dockerfile.$(DOCKER_ARCH)
	docker build --file Dockerfile.$(DOCKER_ARCH) --tag $(DOCKER_IMAGE_NAME) .

clean_build: Dockerfile.$(DOCKER_ARCH)
	docker build --no-cache --pull --file Dockerfile.$(DOCKER_ARCH) --tag $(DOCKER_IMAGE_NAME) .

run: build
	docker run -it --rm \
		-p 8080 \
		-v "$(PWD)/tmp":/etc/dsc-smartthings-server:ro \
		-v "$(PWD)/tmp":/var/lib/dsc-smartthings-server \
		-e SETTINGS_FILE=/etc/dsc-smartthings-server/settings.yml \
		-e DATABASE_DIRECTORY=/var/lib/dsc-smartthings-server \
		-e PORT=8080 \
		-e DEVICE_ADVERTISE_IP=$(IP_ADDRESS) \
		-e DEVICE_ADVERTISE_PORT=8080 \
		-e VIRTUAL_HOST=dsc-smartthings-server.docker \
		--name dsc-smartthings-server \
		$(DOCKER_IMAGE_NAME) $(ARGS)

run_local:
	npm install && \
		DEBUG=node-ssdp* \
		SETTINGS_FILE=./tmp/settings.yml \
		DATABASE_DIRECTORY=./tmp \
		PORT=8080 \
		npm start

push: build
	docker push $(DOCKER_IMAGE_NAME)
