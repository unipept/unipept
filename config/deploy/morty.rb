set :stage, :morty

# don't specify db as it's not needed for unipept
server 'morty.ugent.be', user: 'unipept', roles: [:web, :app], ssh_options: {
  port: 4840
}

set :deploy_to, '/home/unipept/rails'

set :branch, 'develop'
set :rails_env, :development
