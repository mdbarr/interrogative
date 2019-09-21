FROM interrogative-base:latest

RUN useradd -m -d /home/user user && \
        echo "user ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/user && \
        chmod 0440 /etc/sudoers.d/user && \
        mkdir /interrogative && chown user.user /interrogative

WORKDIR /home/user
COPY home /home/user
COPY bin /usr/local/bin
RUN chown -R user.user /home/user
USER user
RUN yarn global add eslint marked
RUN HOME=/home/user git init && \
        git add WELCOME.md .gitignore && \
        git commit -a -m "Initial Commit"
CMD [ "/bin/bash" ]
