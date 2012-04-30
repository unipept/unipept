require 'bundler/capistrano'
set :application, "unipept-web"
set :repository,  "ssh://git@zoidberg.ugent.be:4840/unipept_web.git"

set :scm, :git
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

task :dev do
  set :deploy_to, "/home/bmesuere/rails"
  set :branch, "feature/sunburst"
  set :user, "bmesuere"
  set :use_sudo, false
  set :port, 4840
  set :deploy_via, :remote_cache

  role :web, "scruffy.ugent.be"                          # Your HTTP server, Apache/etc
  role :app, "scruffy.ugent.be"                          # This may be the same as your `Web` server
  role :db,  "scruffy.ugent.be", :primary => true # This is where Rails migrations will run
end

task :prod do
  set :deploy_to, "/home/bmesuere/rails"
  set :user, "bmesuere"
  set :use_sudo, false
  set :port, 4840
  set :deploy_via, :remote_cache

  role :web, "nibbler.ugent.be"                          # Your HTTP server, Apache/etc
  role :app, "nibbler.ugent.be"                          # This may be the same as your `Web` server
  role :db,  "nibbler.ugent.be", :primary => true # This is where Rails migrations will run
end

#own stuff
#set :deploy_to, "/home/bmesuere/rails"
#set :user, "bmesuere"
#set :use_sudo, false
#set :port, 4840
#set :deploy_via, :remote_cache

#role :web, "buruli.ugent.be"                          # Your HTTP server, Apache/etc
#role :app, "buruli.ugent.be"                          # This may be the same as your `Web` server
#role :db,  "buruli.ugent.be", :primary => true # This is where Rails migrations will run

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