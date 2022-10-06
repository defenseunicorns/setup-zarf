FROM alpine:3.16.2 as builder

ARG ZARF_VERSION='0.21.3'

RUN apk add --no-cache --update curl \
    && curl -sSL "https://github.com/defenseunicorns/zarf/releases/download/v${ZARF_VERSION}/zarf_v${ZARF_VERSION}_Linux_amd64" -o /usr/local/bin/zarf \
    && chmod +x /usr/local/bin/zarf

FROM gcr.io/distroless/static:latest

COPY --from=builder /usr/local/bin/zarf /

CMD ["/zarf"]