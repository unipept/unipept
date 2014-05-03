set :application, "unipept-web"
set :repo_url,  "ssh://git@github.ugent.be/bmesuere/unipept.git"

set :deploy_to, "/home/bmesuere/test-deploy"

# set :deploy_to, '/var/www/my_app'
# set :format, :pretty
# set :log_level, :debug
# set :pty, true

# set :linked_files, %w{config/database.yml}
set :linked_dirs, %w{bin log tmp tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

# set :default_env, { path: "/opt/ruby/bin:$PATH" }
# set :keep_releases, 5

namespace :deploy do

  desc 'Restart application'
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
      execute :touch, release_path.join('tmp','restart.txt')
    end
  end

  after :publishing, :restart

end
