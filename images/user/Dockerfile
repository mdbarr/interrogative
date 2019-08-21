FROM interrogative-base:latest

RUN useradd -m -d /home/user user && \
        echo "user ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/user && \
        chmod 0440 /etc/sudoers.d/user

USER user
WORKDIR /home/user
COPY home /home/user
CMD [ "/bin/bash" ]
