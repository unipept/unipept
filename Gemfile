source 'http://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?('/')
  "https://github.com/#{repo_name}.git"
end

gem 'rails', '5.1.2'

gem 'mysql2'

# jquery
gem 'jquery-rails'

# Use Puma as the app server
gem 'puma', '~> 3.7'

# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 3.0'

# pagination
gem 'will_paginate'

# cas auth
gem 'devise', '>= 3.5'
gem 'devise_cas_authenticatable'
gem 'responders', '>= 2.0'

# zeroclipboard
gem 'zeroclipboard-rails'

# needed for asset creation
gem 'therubyracer'

# faster json
# pinned on 2.17 because of an issue with 2.18: https://github.com/ohler55/oj/issues/325
gem 'oj', '2.17.5'

# imagemagick bindings
gem 'rmagick', require: false

# coveralls
gem 'coveralls', require: false

# The dynamic stylesheet language for the Rails asset pipeline.
# Allows other gems to extend Less load path.
gem 'less-rails'

# auto css prefixer
gem 'autoprefixer-rails'

# Uglifier minifies JavaScript files by wrapping UglifyJS to be accessible
# in Ruby
gem 'uglifier', '>= 1.3.0'

# Exception emails
gem 'exception_notification', git: 'git://github.com/unipept/exception_notification.git'

# Deploy with Capistrano
gem 'capistrano', '~> 3.0'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '~> 2.13'
  gem 'selenium-webdriver'

  gem 'poltergeist'
  gem 'rails-controller-testing'
end

gem 'listen', '>= 3.0.5', '< 3.2'

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console', '>= 3.3.0'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

group :development do
  gem 'capistrano-bundler', '~> 1.1', require: false
  gem 'capistrano-rails',   '~> 1.1', require: false
  gem 'capistrano-rvm', require: false
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]

# API stats
gem 'stathat'

group :development do
  gem 'annotate' # annotate models with database info
  gem 'guard'
  gem 'guard-minitest' # auto run tests
  gem 'rubocop', require: false
  # gem 'terminal-notifier-guard', git: 'git://github.com/unipept/terminal-notifier-guard.git' # mac notifications
  gem 'rake'
  gem 'sprockets'
  gem 'terminal-notifier'
end
