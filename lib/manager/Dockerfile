FROM interrogative-core:latest as build

FROM node:10-alpine
WORKDIR /interrogative
COPY --from=build /interrogative .
VOLUME /interrogative/interviews
EXPOSE 1311
ENTRYPOINT [ "/interrogative/bin/cli.js", "--manager" ]
