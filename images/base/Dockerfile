FROM ubuntu:bionic

RUN apt-get update && \
    rm /etc/dpkg/dpkg.cfg.d/excludes && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
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
        python-dev \
        python3-dev \
        shared-mime-info \
        shellcheck \
        sudo \
        telnet \
        tig \
        tmux \
        vim \
        wget && \
        curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
        curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
        echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
        apt-get update && \
        apt-get dist-upgrade -y && \
        apt-get install -y nodejs yarn && \
        apt-get autoremove && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8
