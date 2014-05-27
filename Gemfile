source 'http://rubygems.org'

gem 'rails', '4.1.1'

gem 'mysql2'

# Protect attributes from mass assignment
gem "protected_attributes"

# pagination
gem 'will_paginate'

# jquery
gem 'jquery-rails'
gem "jquery-ui-rails", "4.0.2"

# cas auth
gem 'devise'
gem 'devise_cas_authenticatable'

# needed for asset creation
gem 'therubyracer'

# faster json
gem 'oj'

# imagemagick bindings
gem "rmagick"

# do HTTP requests
gem "httparty"

# The dynamic stylesheet language for the Rails asset pipeline.
# Allows other gems to extend Less load path.
gem "less-rails"

# Uglifier minifies JavaScript files by wrapping UglifyJS to be accessible
# in Ruby
gem "uglifier"

group :development do
  gem 'rspec-rails'
	gem 'annotate'
	gem "rake"
	gem 'sprockets'
end

group :test do
  gem 'rspec'
  gem 'webrat'
	gem 'spork'
	gem 'be_valid_asset'
#	gem 'factory_girl_rails'
end

#default stuff

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

# gem 'sqlite3-ruby', :require => 'sqlite3'

# Use unicorn as the web server
# gem 'unicorn'

# Exception emails
gem 'exception_notification', :git => 'git://github.com/bmesuere/exception_notification.git'

# Deploy with Capistrano
gem 'capistrano', '~> 3.0'
group :development do
  gem 'capistrano-rails',   '~> 1.1', require: false
  gem 'capistrano-bundler', '~> 1.1', require: false
  gem 'capistrano-rvm', require: false
end
# To use debugger (ruby-debug for Ruby 1.8.7+, ruby-debug19 for Ruby 1.9.2+)
# gem 'ruby-debug'
# gem 'ruby-debug19'

# Bundle the extra gems:
# gem 'bj'
# gem 'nokogiri'
# gem 'sqlite3-ruby', :require => 'sqlite3'
# gem 'aws-s3', :require => 'aws/s3'

# Bundle gems for the local environment. Make sure to
# put test-only gems in this group so their generators
# and rake tasks are available in development mode:
# group :development, :test do
#   gem 'webrat'
# end
