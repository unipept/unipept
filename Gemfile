source 'http://rubygems.org'

gem 'rails', '4.1.8'

gem 'mysql2'

# Protect attributes from mass assignment
gem "protected_attributes"

# pagination
gem 'will_paginate'

# jquery
gem 'jquery-rails'
gem "jquery-ui-rails"

# cas auth
gem 'devise'
gem 'devise_cas_authenticatable'

# zeroclipboard
gem 'zeroclipboard-rails'

# needed for asset creation
gem 'therubyracer'

# simple HTTP calls
gem 'httparty'

# faster json
gem 'oj'

# imagemagick bindings
gem "rmagick", require: false

# coveralls
gem "coveralls", require: false

# The dynamic stylesheet language for the Rails asset pipeline.
# Allows other gems to extend Less load path.
gem "less-rails"

# auto css prefixer
gem "autoprefixer-rails"

# Uglifier minifies JavaScript files by wrapping UglifyJS to be accessible
# in Ruby
gem "uglifier"

# Exception emails
gem 'exception_notification', :git => 'git://github.com/unipept/exception_notification.git'

# Deploy with Capistrano
gem 'capistrano', '~> 3.0'

group :development do
  gem 'capistrano-rails',   '~> 1.1', require: false
  gem 'capistrano-bundler', '~> 1.1', require: false
  gem 'capistrano-rvm', require: false
end

# API stats
gem "stathat"

group :development do
	gem 'annotate' # annotate models with database info
  gem 'guard-minitest' # auto run tests
  gem 'terminal-notifier-guard', :git => 'git://github.com/unipept/terminal-notifier-guard.git' # mac notifications
  gem 'terminal-notifier'
	gem "rake"
	gem 'sprockets'
end

group :test do
  gem 'capybara'
  gem 'poltergeist'
end
