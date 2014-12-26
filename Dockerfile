FROM ubuntu:14.04
MAINTAINER felix.vanderjeugt@gmail.com

RUN apt-get update

# Installing tools
RUN apt-get install -qq -y git unzip curl ca-certificates --no-install-recommends

# Installing Apache
RUN apt-get install -qq -y apache2 --no-install-recommends

# Install mysql
RUN echo mysql-server mysql-server/root_password password strangehat | debconf-set-selections
RUN echo mysql-server mysql-server/root_password_again password strangehat | debconf-set-selections
RUN apt-get install -qq -y mysql-server --no-install-recommends

# Installing Ruby
RUN apt-get install -qq -y libcurl4-openssl-dev apache2-threaded-dev libapr1-dev libaprutil1-dev --no-install-recommends
RUN gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
RUN curl -L https://get.rvm.io | bash -s stable
RUN [ ! -d ${APACHE_RUN_DIR:-/var/run/apache2} ] && mkdir -p ${APACHE_RUN_DIR:-/var/run/apache2}
RUN [ ! -d ${APACHE_LOCK_DIR:-/var/lock/apache2} ] && mkdir ${APACHE_RUN_USER:-www-data} ${APACHE_LOCK_DIR:-/var/lock/apache2}
RUN bash -c '. /etc/profile.d/rvm.sh; rvm install 2.1; gem install passenger; . /etc/apache2/envvars; yes | passenger-install-apache2-module'

# Install ImageMagick from source
# RUN apt-get update
# RUN apt-get install -y wget
# RUN wget ftp://ftp.imagemagick.org/pub/ImageMagick/ImageMagick.tar.gz
# RUN tar -xzvf ImageMagick.tar.gz
# RUN cd ImageMagick-*; ./configure --prefix=/usr/local --with-x=no --disable-static --with-modules --without-perl --without-magick-plus-plus --with-quantum-depth=8 --disable-openmp; make; make install
# RUN /sbin/ldconfig /usr/local
# RUN ln -f /usr/local/bin/Magick-config /usr/bin/Magick-config
# RUN PKG_CONFIG_PATH=/usr/local/lib/pkgconfig/ gem install rmagick
RUN apt-get install -y -qq ruby-rmagick libmagickwand-dev

# Install nodejs
RUN apt-get install -qq -y nodejs --no-install-recommends

RUN mkdir -p /root/rails
WORKDIR /root/rails
ADD Gemfile /root/rails/
RUN sed -i '/terminal-notifier-guard/d' Gemfile
ADD Gemfile.lock /root/rails/
RUN bash -c '. /etc/profile.d/rvm.sh; bundle install --system'
ADD . /root/rails/
RUN bash -c '. /etc/profile.d/rvm.sh; RAILS_ENV=production bundle exec rake assets:precompile'

# enable some modules
RUN ln -s /etc/apache2/mods-available/expires.load /etc/apache2/mods-enabled/
RUN ln -s /etc/apache2/mods-available/headers.load /etc/apache2/mods-enabled/
ADD apache_default /etc/apache2/sites-available/default

#enable `*.json` compression in `/etc/apache2/mods-enabled/deflate.conf`
RUN sed -i '/rss/a\\t\tAddOutputFilterByType DEFLATE application/json' /etc/apache2/mods-enabled/deflate.conf

# Restart apache
RUN /etc/init.d/apache2 restart

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


# Cleaning APT stuff
RUN rm -rf /var/lib/apt/lists/*

EXPOSE 80
CMD ["bash", "-c", ". /etc/profile.d/rvm.sh && rake db:setup && passenger start -a 0.0.0.0 -p 80 -e production"]
