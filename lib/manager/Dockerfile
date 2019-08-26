FROM node:10 as build
WORKDIR /interrogative
COPY package.json yarn.lock ./
RUN yarn --silent install
COPY . .
RUN yarn build

FROM node:10-alpine
WORKDIR /interrogative
COPY --from=build /interrogative .
VOLUME /interviews
EXPOSE 1311
ENTRYPOINT [ "/interrogative/lib/manager/manager.js" ]
