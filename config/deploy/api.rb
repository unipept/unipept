set :stage, :api

# don't specify db as it's not needed for unipept
server "mycroft.ugent.be", user: 'bmesuere', roles: [:web, :app], ssh_options: {
  port: 4840,
}

set :branch, 'develop'
set :rails_env, :development
