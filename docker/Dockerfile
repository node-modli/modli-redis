FROM ubuntu:14.04
MAINTAINER TechnologyAdvice

ENV REDIS_USER=redis
ENV REDIS_PASSWORD=modli
ENV REDIS_DATA_DIR=/var/lib/redis
ENV REDIS_LOG_DIR=/var/log/redis

RUN apt-get update \
 && apt-get install -y redis-server \
 && sed 's/^daemonize yes/daemonize no/' -i /etc/redis/redis.conf \
 && sed 's/^bind 127.0.0.1/bind 0.0.0.0/' -i /etc/redis/redis.conf \
 && sed 's/^# unixsocket /unixsocket /' -i /etc/redis/redis.conf \
 && sed 's/^# unixsocketperm 755/unixsocketperm 777/' -i /etc/redis/redis.conf \
 && sed '/^logfile/d' -i /etc/redis/redis.conf \
 && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /sbin/entrypoint.sh
RUN chmod 755 /sbin/entrypoint.sh

EXPOSE 6379/tcp
#VOLUME ["${REDIS_DATA_DIR}"]
ENTRYPOINT ["/sbin/entrypoint.sh"]