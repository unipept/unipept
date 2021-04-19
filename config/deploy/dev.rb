set :stage, :dev

# don't specify db as it's not needed for unipept
server 'morty.ugent.be', user: 'unipept', roles: %i[web app], ssh_options: {
  port: 4840
}

set :branch, 'develop'
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

namespace :deploy do
  desc "Uploads a robots.txt that mandates the site as off-limits to crawlers"
  task :block_robots, :roles => :app do
    content = [
      '# This is a staging site. Do not index.',
      'User-agent: *',
      'Disallow: /'
    ].join($/)

    logger.info "Uploading blocking robots.txt"
    put content, "#{release_path}/public/robots.txt"
  end
end

after "deploy:update_code", "deploy:block_robots"
