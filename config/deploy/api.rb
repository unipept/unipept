set :stage, :api

set :deploy_to, '/home/unipept/rails'

# don't specify db as it's not needed for unipept
# Can be used for sherlock, rick and mycroft
server 'sherlock.ugent.be', user: 'unipept', roles: %i[web app], ssh_options: {
  port: 4840
}

set :branch, 'api'
set :rails_env, :production
