set :stage, :api

# don't specify db as it's not needed for unipept
server 'api.unipept.ugent.be', user: 'bmesuere', roles: %i[web app api], ssh_options: {
  port: 4840
}

set :deploy_to, '/home/bmesuere/rails'

set :branch, 'api'
set :rails_env, :production

on roles :api do
  Rake::Task['yarn:install'].clear_actions
  Rake::Task['deploy:compile_assets'].clear_actions
end
