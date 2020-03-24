source 'http://rubygems.org'

git_source(:github) { |repo| "https://github.com/#{repo}.git" }

gem 'rails', '~> 5.2.2'

gem 'mysql2', '~> 0.5.3'

gem 'webpacker', '~> 4.2.2'

# Use Puma as the app server
gem 'puma', '~> 3.12'

# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 4.0'

# pagination
gem 'will_paginate', '~>3.2.1'

# cas auth
gem 'devise', '~> 4.7.1'
gem 'devise_cas_authenticatable', '~> 1.10.4'

# needed for asset creation
gem 'therubyracer', '~> 0.12.3', platforms: :ruby

gem 'bootsnap', '~>  1.4.4', require: false

# faster json
gem 'oj',  '~> 3.10.5'

gem 'multi_json',  '~> 1.14.1'
gem 'jbuilder',  '~> 2.9.1'

# imagemagick bindings
gem 'rmagick',  '~> 4.1.0.rc2', require: false

# The dynamic stylesheet language for the Rails asset pipeline.
# Allows other gems to extend Less load path.
gem 'less-rails',  '~> 4.0.0'

# auto css prefixer
gem 'autoprefixer-rails',  '~> 9.7.5'

# Uglifier minifies JavaScript files by wrapping UglifyJS to be accessible
# in Ruby
gem 'uglifier',  '~> 4.2.0'

# Exception emails
gem 'exception_notification',  '~> 4.4.0'

# Deploy with Capistrano
gem 'capistrano', '~> 3.11.2'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', '~> 11.1.1', platforms: [:mri, :mingw, :x64_mingw]
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '~> 3.31.0'
  gem 'selenium-webdriver', '~> 3.142.7'

  gem 'poltergeist', '~> 1.18.1'
  gem 'rails-controller-testing', '~> 1.0.4'
end

gem 'listen', '~> 3.2.1'

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console', '>= 3.3.0'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring', '~> 2.1.0'
  gem 'spring-watcher-listen', '~> 2.0.1'
  gem 'foreman', '~> 0.87.0'
end

group :development do
  gem 'capistrano-bundler', '~> 1.6.0', require: false
  gem 'capistrano-rails',   '~> 1.4.0', require: false
  gem 'capistrano-rvm', '~> 0.1.2', require: false
  gem 'capistrano-yarn', '~> 2.0.2'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]

# API stats
gem 'stathat', '~> 0.1.7'

group :development do
  gem 'annotate', '~> 3.0.3' # annotate models with database info
  gem 'guard', '~> 2.16.1'
  gem 'guard-minitest', '~> 2.4.6' # auto run tests
  gem 'rubocop', '~> 0.79.0'
  gem 'rake', '~> 13.0.1'
  gem 'sprockets', '~> 3.7.2'
end
