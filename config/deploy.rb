set :application, "unipept-web"
set :repo_url,  "ssh://git@github.ugent.be/bmesuere/unipept.git"

set :deploy_to, "/home/bmesuere/test-deploy"

# set :linked_files, %w{config/database.yml}
set :linked_dirs, %w{bin log tmp tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

namespace :deploy do

  desc 'Restart application'
  task :passenger do
    on roles(:web) do
      execute :touch, release_path.join('tmp','restart.txt')
    end
  end

  after :publishing, :passenger

end
