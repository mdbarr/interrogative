FROM interrogative-user:latest
WORKDIR /interrogative
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
ENTRYPOINT [ "/interrogative/bin/cli.js", "--container" ]
