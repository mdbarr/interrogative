FROM interrogative-user:latest
WORKDIR /interrogative
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
ENTRYPOINT [ "/interrogative/lib/container/container.js" ]
