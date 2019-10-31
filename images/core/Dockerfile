FROM node:12
WORKDIR /interrogative
COPY package.json yarn.lock ./
RUN yarn install
COPY bin bin
COPY *.js ./
COPY public public
COPY src src
RUN yarn build && \
        rm -rf node_modules && \
        yarn install --production && \
        yarn cache clean
COPY lib lib
