#Stage "builder"
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod tidy
COPY . .
RUN go build -o server ./cmd/server

#Stage "final"
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server ./
RUN adduser -D appuser && chown appuser /app/server
USER appuser
ENV PORT=8080
EXPOSE 8080
CMD [ "./server" ]