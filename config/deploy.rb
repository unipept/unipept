set :application, 'unipept-web'
set :repo_url,  'ssh://git@github.ugent.be/unipept/unipept.git'

set :deploy_to, '/home/unipept/rails'

# set :linked_files, %w{config/database.yml}
set :linked_dirs, %w[bin log tmp vendor/bundle public/system]

namespace :deploy do
  desc 'Restart application'
  task :restart do
    on roles(:web) do
      execute :touch, release_path.join('tmp', 'restart.txt')
    end
  end

  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
    end
  end

  after :finishing, 'deploy:cleanup'
  after 'deploy:publishing', 'deploy:restart'
end
