FROM interrogative-core:latest as build

FROM node:10-alpine
WORKDIR /interrogative
COPY --from=build /interrogative .
EXPOSE 25 587
ENTRYPOINT [ "/interrogative/bin/cli.js", "--messenger" ]
