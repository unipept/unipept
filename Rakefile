# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require_relative 'config/application'
require 'rake'

if ENV['CI'] != 'true' && %w[development test].include?(Rails.env)
  require 'rubocop/rake_task'
  RuboCop::RakeTask.new
end

UnipeptWeb::Application.load_tasks
