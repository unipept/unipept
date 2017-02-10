set :stage, :feat

# don't specify db as it's not needed for unipept
server 'adler.ugent.be', user: 'bmesuere', roles: [:web, :app], ssh_options: {
  port: 4840
}

set :branch, 'feature/adler-test'
set :rails_env, :development
