IMAGE_NAME=ubuntu:nodejs
PORT=2222
VOLUME_CODE=${CURDIR}:/app
VOLUME_OUTPUT=${CURDIR}/output:/app/output
VOLUME_IMAGE=${CURDIR}/images:/app/input
CONTAINER_NAME=node-ubuntu

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -it  \
      -v $(VOLUME_IMAGE) \
      -v $(VOLUME_OUTPUT) \
      -v $(VOLUME_CODE) \
      --name $(CONTAINER_NAME) \
      $(IMAGE_NAME)

