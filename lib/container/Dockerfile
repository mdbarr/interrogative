FROM interrogative-core:latest as build

FROM interrogative-user:latest
WORKDIR /interrogative
COPY --from=build /interrogative .
ENTRYPOINT [ "/interrogative/bin/cli.js", "--container" ]
