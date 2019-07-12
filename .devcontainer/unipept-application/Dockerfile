FROM drecom/ubuntu-ruby:2.4.5

ENV MAINTAINER="Pieter Verschaffelt (pieter.verschaffelt@ugent.be)"

RUN mkdir /workspace
WORKDIR /workspace

# Install ruby-debug-ide and debase
RUN gem install ruby-debug-ide
RUN gem install debase
RUN gem install bundler

# Install git, process tools
RUN apt-get update && apt-get -y install git procps nodejs mysql-client dos2unix

# Build oj from source
RUN gem install oj -v '2.17.5' --source 'http://rubygems.org/'

# Clean up
RUN apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Set the default shell to bash instead of sh
ENV SHELL /bin/bash
