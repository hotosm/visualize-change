from ubuntu:latest

RUN apt update && \
    apt install -y python-dev python-pip apt-transport-https \
      ca-certificates curl software-properties-common && \
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" && \
    apt update && apt install -y docker-ce && \
    pip install docker-compose awscli==1.11.76
