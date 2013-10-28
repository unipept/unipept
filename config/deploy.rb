require 'bundler/capistrano'
require 'new_relic/recipes'

set :application, "unipept-web"
set :repository,  "ssh://git@github.ugent.be/bmesuere/unipept.git"

set :scm, :git
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

task :feat do
  set :deploy_to, "/home/bmesuere/rails"
  set :branch, "feature/thesis"
  set :user, "bmesuere"
  set :use_sudo, false
  set :port, 4840
  set :deploy_via, :remote_cache

  role :web, "scruffy.ugent.be"                          # Your HTTP server, Apache/etc
  role :app, "scruffy.ugent.be"                          # This may be the same as your `Web` server
  role :db,  "scruffy.ugent.be", :primary => true # This is where Rails migrations will run
end

task :dev do
  set :deploy_to, "/home/bmesuere/rails"
  set :branch, "develop"
  set :user, "bmesuere"
  set :use_sudo, false
  set :port, 4840
  set :deploy_via, :remote_cache

  role :web, "scruffy.ugent.be"                          # Your HTTP server, Apache/etc
  role :app, "scruffy.ugent.be"                          # This may be the same as your `Web` server
  role :db,  "scruffy.ugent.be", :primary => true # This is where Rails migrations will run
end

task :prod do
  load 'deploy/assets'
  set :deploy_to, "/home/bmesuere/rails"
  set :branch, "master"
  set :user, "bmesuere"
  set :use_sudo, false
  set :port, 4840
  set :deploy_via, :remote_cache

  role :web, "sherlock.ugent.be"                          # Your HTTP server, Apache/etc
  role :app, "sherlock.ugent.be"                          # This may be the same as your `Web` server
  role :db,  "sherlock.ugent.be", :primary => true # This is where Rails migrations will run

  # We need to run this after our collector mongrels are up and running
  # This goes out even if the deploy fails, sadly
  after "deploy:update", "newrelic:notice_deployment"
end

# If you are using Passenger mod_rails uncomment this:
# if you're still using the script/reapear helper you will need
# these http://github.com/rails/irs_process_scripts

namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end
