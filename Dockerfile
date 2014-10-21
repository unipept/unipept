FROM ruby:2.1.3

# Install ImageMagick from source
RUN apt-get update
RUN apt-get install -y wget
RUN wget ftp://ftp.imagemagick.org/pub/ImageMagick/ImageMagick.tar.gz
RUN tar -xzvf ImageMagick.tar.gz
RUN cd ImageMagick-*; ./configure --prefix=/usr/local --with-x=no --disable-static --with-modules --without-perl --without-magick-plus-plus --with-quantum-depth=8 --disable-openmp; make; make install
RUN /sbin/ldconfig /usr/local
RUN ln -f /usr/local/bin/Magick-config /usr/bin/Magick-config
RUN PKG_CONFIG_PATH=/usr/local/lib/pkgconfig/ gem install rmagick

# Build the application in
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD Gemfile /usr/src/app/
ADD Gemfile.lock /usr/src/app/
ADD . /usr/src/app
RUN bundle install --system

# Install nodejs
RUN apt-get install -y nodejs --no-install-recommends

# Cleaning APT stuff
RUN rm -rf /var/lib/apt/lists/*

# Open up port 3000 and run `rails server`
EXPOSE 3000
CMD ["rails", "server"]
