FROM ubuntu:bionic

RUN apt-get update && \
    rm /etc/dpkg/dpkg.cfg.d/excludes && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        apt-transport-https \
        autoconf \
        automake \
        bison \
        build-essential \
        ca-certificates \
        curl \
        dnsutils \
        emacs25-el \
        emacs25-nox \
        flex \
        gdb \
        gettext \
        git  \
        gnupg2 \
        hexedit \
        iproute2 \
        iputils-ping \
        keychain \
        less \
        libbz2-dev \
        libffi-dev \
        liblzma-dev \
        libncurses5-dev \
        libreadline-dev \
        libssh-dev \
        libssl-dev \
        libtool \
        locales \
        locales-all \
        man \
        manpages \
        manpages-dev \
        manpages-posix \
        manpages-posix-dev \
        nano \
        netbase \
        netcat \
        openssh-client \
        powerline \
        python \
        python-dev \
        python-pip \
        shared-mime-info \
        shellcheck \
        sudo \
        telnet \
        tig \
        tmux \
        vim \
        wget \
        zlib1g-dev && \
        curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
        curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
        echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
        apt-get update && \
        apt-get dist-upgrade -y && \
        apt-get install -y nodejs yarn && \
        apt-get autoremove && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*

RUN cd /usr/local/src && \
  wget https://www.python.org/ftp/python/3.7.5/Python-3.7.5.tgz && \
  tar -xvf Python-3.7.5.tgz && \
  cd Python-3.7.5/ && \
  ./configure --enable-shared && \
  make install && \
  ldconfig -v && \
  cd .. && \
  rm -rf Python* && \
  pip3 install virtualenv

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8
