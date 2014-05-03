set :stage, :feat

# don't specify db as it's not needed for unipept
server "scruffy.ugent.be" user: 'bmesuere', roles: %{web app}, ssh_options: {
  port: 4840,
}

set :branch, 'feature/thesis'
set :rails_env, :development
