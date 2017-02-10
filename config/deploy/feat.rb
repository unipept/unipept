set :stage, :feat

# don't specify db as it's not needed for unipept
server 'adler.ugent.be', user: 'bmesuere', roles: [:web, :app], ssh_options: {
  port: 4840
}

set :branch, 'feature/develop-functional-analysis-tpa'
set :rails_env, :development
