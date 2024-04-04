# SPDX-License-Identifier: MIT

# Instructions:
# docker build -t qttest-utils .
# docker run -it -v /data/sources/copilot/qttest-utils/:/qttest-utils/ --cap-add=SYS_PTRACE --security-opt seccomp=unconfined --ulimit nofile=1024:4096 -u 1000:1000 qttest-utils
# cd /qttest-utils/

FROM ubuntu:23.04
MAINTAINER Sergio Martins (sergio.martins@kdab.com)

ENV TZ=Europe/Berlin
ENV LC_CTYPE=C.UTF-8

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

## Installs node 18v
RUN apt update -qq && apt install build-essential software-properties-common lld git cmake ninja-build nodejs -y
