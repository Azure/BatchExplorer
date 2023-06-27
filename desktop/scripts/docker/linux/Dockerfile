FROM ubuntu:16.04

# Environement
ENV NODE_VERSION 10.8.0
ENV PYTHON_VERSION 3.6.5

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh


RUN apt-get update && \
    apt-get install -y wget git

# Instal nvm
RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

# nvm env
ENV NVM_DIR /root/.nvm

# Install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN wget -qO- https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer | bash \
    && echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc \
    && echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc \
    && echo 'eval "$(pyenv init -)"' >> ~/.bashrc \
    && echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc


ENV PYENV_ROOT /root/.pyenv

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev llvm libncurses5-dev xz-utils \
        ca-certificates && \
    $PYENV_ROOT/bin/pyenv install $PYTHON_VERSION && \
    $PYENV_ROOT/bin/pyenv global $PYTHON_VERSION && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

CMD ["/bin/bash"]
