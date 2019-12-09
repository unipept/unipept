set :stage, :dev

# don't specify db as it's not needed for unipept
server 'morty.ugent.be', user: 'unipept', roles: %i[web app], ssh_options: {
  port: 4840
}

set :branch, 'update/web-components-0.1.6'
set :rails_env, :production

# Perform yarn install before precompiling the assets in order to pass the
# integrity check.
namespace :deploy do
  namespace :assets do
    before :precompile, :yarn_install do
      on release_roles(fetch(:assets_roles)) do
        within release_path do
          with rails_env: fetch(:rails_env) do
            execute :yarn, "install"
          end
        end
      end
    end
  end
end

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