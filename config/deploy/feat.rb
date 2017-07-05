set :stage, :feat

# don't specify db as it's not needed for unipept
server 'morty.ugent.be', user: 'unipept', roles: %i[web app], ssh_options: {
  port: 4840
}

set :branch, 'feature/rails-5.1'
set :rails_env, :development
