export USER=`whoami`

export LANG="en_US.UTF-8"
HISTCONTROL=ignoreboth
shopt -s histappend
HISTSIZE=1000
HISTFILESIZE=2000

alias ls='ls --color=auto'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

if [ -x "$(command -v yarn)" ]; then
    export PATH="$(yarn global bin):$PATH"
fi

source /usr/share/powerline/bindings/bash/powerline.sh
