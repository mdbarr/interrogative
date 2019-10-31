FROM interrogative-core:latest as build

FROM node:12-alpine
WORKDIR /interrogative
COPY --from=build /interrogative .
EXPOSE 1311
ENTRYPOINT [ "/interrogative/bin/cli.js", "--manager" ]
