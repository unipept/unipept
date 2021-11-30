set :stage, :prod

set :deploy_to, '/home/unipept/rails'

# don't specify db as it's not needed for unipept
server 'unipeptweb.ugent.be', user: 'unipept', roles: %i[web app], ssh_options: {
  port: 22
}

set :branch, 'fix/update_api_url'
set :rails_env, :production

namespace :deploy do
  before :publishing, :asset_stuff do
    on roles :all do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :rake, 'assets:precompile'
          execute :rake, 'assets:nodigest'
        end
      end
    end
  end
end
