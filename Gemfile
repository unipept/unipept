source 'http://rubygems.org'

git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.7.1'

gem 'rails', '~> 6.0.3', '>= 6.0.3.2'

gem 'mysql2', '~> 0.5.3'

gem 'webpacker', '~> 5.2.1'

# Use Puma as the app server
gem 'puma', '~> 5.2'

# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 4.0'

# pagination
gem 'will_paginate', '~>3.3.0'

# cas auth
gem 'devise', '~> 4.7.3'
gem 'devise_cas_authenticatable', '~> 1.10.4'

# needed for asset creation
gem 'therubyracer', '~> 0.12.3', platforms: :ruby

gem 'bootsnap', '~> 1.7.2', require: false

# faster json
gem 'oj',  '~> 3.11.2'

gem 'multi_json',  '~> 1.15.0'
gem 'jbuilder',  '~> 2.11.2'

# imagemagick bindings
gem 'rmagick',  '~> 4.1.1', require: false

# The dynamic stylesheet language for the Rails asset pipeline.
# Allows other gems to extend Less load path.
gem 'less-rails',  '~> 5.0.0'

# auto css prefixer
gem 'autoprefixer-rails',  '~> 10.2.4'

# Uglifier minifies JavaScript files by wrapping UglifyJS to be accessible
# in Ruby
gem 'uglifier',  '~> 4.2.0'

# Exception emails
gem 'exception_notification',  '~> 4.4.3'

# Deploy with Capistrano
gem 'capistrano', '~> 3.14.1'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', '~> 11.1.1', platforms: [:mri, :mingw, :x64_mingw]
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '~> 3.35.3'
  gem 'selenium-webdriver', '~> 3.142.7'

  gem 'poltergeist', '~> 1.18.1'
  gem 'rails-controller-testing', '~> 1.0.4'
end

gem 'listen', '~> 3.4.1'

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console', '>= 3.3.0'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring', '~> 2.1.0'
  gem 'spring-watcher-listen', '~> 2.0.1'
  gem 'foreman', '~> 0.87.1'
end

group :development do
  gem 'capistrano-bundler', '~> 2.0.1', require: false
  gem 'capistrano-rails',   '~> 1.6.1', require: false
  gem 'capistrano-rvm', '~> 0.1.2', require: false
  gem 'capistrano-yarn', '~> 2.0.2'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]

# API stats
gem 'stathat', '~> 0.1.7'

group :development do
  gem 'annotate', '~> 3.1.1' # annotate models with database info
  gem 'guard', '~> 2.16.2'
  gem 'guard-minitest', '~> 2.4.6' # auto run tests
  gem 'rubocop', '~> 0.90.0'
  gem 'rake', '~> 13.0.3'
  gem 'sprockets', '~> 3.7.2'
end

gem "octokit", "~> 4.20"
