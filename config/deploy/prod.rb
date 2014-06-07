require 'capistrano/rails/assets'
set :stage, :prod

# don't specify db as it's not needed for unipept
server "sherlock.ugent.be", user: 'bmesuere', roles: [:web, :app], ssh_options: {
  port: 4840,
}

set :branch, 'master'
set :rails_env, :production

namespace :deploy do

  after :compile_assets, :asset_stuff do
    on roles :all do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :rake, 'assets:nodigest'
        end
      end
    end
  end

end