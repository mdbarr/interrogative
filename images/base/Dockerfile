FROM ubuntu:bionic

RUN apt-get update && \
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
        iputils-ping \
        keychain \
        less \
        libtool \
        manpages \
        nano \
        netbase \
        openssh-client \
        powerline \
        python-dev \
        python3-dev \
        shared-mime-info \
        sudo \
        telnet \
        tmux \
        vim \
        wget && \
        curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
        curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
        echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
        apt-get update && \
        apt-get dist-upgrade -y && \
        apt-get install -y nodejs yarn && \
        apt-get autoremove && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*
