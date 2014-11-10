source 'http://rubygems.org'

gem 'rails', '4.1.7'

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

# zeroclipboard
gem 'zeroclipboard-rails'

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
