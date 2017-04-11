set :stage, :api

# don't specify db as it's not needed for unipept
server 'api.unipept.ugent.be', user: 'bmesuere', roles: %i[web app], ssh_options: {
  port: 4840
}

set :branch, 'api'
set :rails_env, :production
