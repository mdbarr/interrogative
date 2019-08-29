FROM interrogative-user:latest
WORKDIR /interrogative
COPY package.json yarn.lock ./
RUN yarn install --production && \
        rm -rf ~/.cache ~/.yarn ~/.node-gyp
COPY . .
ENTRYPOINT [ "/interrogative/bin/cli.js", "--container" ]
