FROM ubuntu:14.04
MAINTAINER felix.vanderjeugt@gmail.com

# Preconfiguring mysql paswords
RUN echo mysql-server mysql-server/root_password password strangehat | debconf-set-selections && \
    echo mysql-server mysql-server/root_password_again password strangehat | debconf-set-selections

# Installing everything
RUN apt-get update              && \
    apt-get install -qq -y         \
        git                        \
        unzip                      \
        curl                       \
        ca-certificates            \
        apache2                    \
        mysql-server               \
        libcurl4-openssl-dev       \
        apache2-threaded-dev       \
        libapr1-dev                \
        libaprutil1-dev            \
        ruby-rmagick               \
        libmagickwand-dev          \
        nodejs                     \
        --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Configuration and further installation
RUN \
    # enable some modules
    ln -s /etc/apache2/mods-available/expires.load /etc/apache2/mods-enabled/ && \
    ln -s /etc/apache2/mods-available/headers.load /etc/apache2/mods-enabled/ && \
    # enable `*.json` compression in `/etc/apache2/mods-enabled/deflate.conf`
    sed -i '/rss/a\\t\tAddOutputFilterByType DEFLATE application/json' /etc/apache2/mods-enabled/deflate.conf && \
    # Installing Ruby
    gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 && \
    curl -L https://get.rvm.io | bash -s stable && \
    mkdir -p ${APACHE_RUN_DIR:-/var/run/apache2} && \
    mkdir -p ${APACHE_RUN_USER:-www-data} ${APACHE_LOCK_DIR:-/var/lock/apache2} && \
    bash -c ' \
        . /etc/profile.d/rvm.sh;              \
        rvm install 2.1;                      \
        gem install passenger;                \
        . /etc/apache2/envvars;               \
        yes | passenger-install-apache2-module'

# Add Rails app
RUN mkdir -p /root/rails
WORKDIR /root/rails
ADD Gemfile /root/rails/
RUN sed -i '/terminal-notifier-guard/d' Gemfile
ADD Gemfile.lock /root/rails/
RUN bash -c '. /etc/profile.d/rvm.sh; bundle install --system'
ADD app/ /root/rails/app/
ADD config/ /root/rails/config/
ADD db/ /root/rails/db/
ADD lib/ /root/rails/lib/
ADD public/ /root/rails/public/
ADD script/ /root/rails/script/
ADD vendor/ /root/rails/vendor/
ADD Capfile config.ru Guardfile LICENSE.md Rakefile README.md /root/rails/
RUN ls /root/rails/
RUN bash -c '. /etc/profile.d/rvm.sh; RAILS_ENV=production bundle exec rake assets:precompile'

# Add apache default
ADD apache_default /etc/apache2/sites-available/default

# Restart apache
RUN /etc/init.d/apache2 restart

# Unipept on gate 80
EXPOSE 80

# Add entrypoint
ADD entrypoint.sh /entrypoint.sh

# edit /etc/logrotate.conf
#/home/bmesuere/rails/shared/log/*.log {
#    daily
#    missingok
#    rotate 7
#    compress
#    delaycompress
#    notifempty
#    copytruncate
#}

#RUN apt-get install logcheck

#sudo pico /etc/logcheck/logcheck.conf
# change email
#SENDMAILTO="bart.mesuere@ugent.be"

ENTRYPOINT "/entrypoint.sh"
