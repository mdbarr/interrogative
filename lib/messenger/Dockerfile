FROM interrogative-core:latest as build

FROM node:12-alpine
WORKDIR /interrogative
COPY --from=build /interrogative .
COPY templates templates
EXPOSE 25 587
ENTRYPOINT [ "/interrogative/bin/cli.js", "--messenger" ]
