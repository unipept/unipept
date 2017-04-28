set :stage, :feat

# don't specify db as it's not needed for unipept
server 'adler.ugent.be', user: 'bmesuere', roles: %i[web app], ssh_options: {
  port: 4840
}

set :branch, 'add-functional-analysis-tpa-to-develop'
set :rails_env, :development
