set :stage, :feat

# don't specify db as it's not needed for unipept
server 'adler.ugent.be', user: 'bmesuere', roles: [:web, :app], ssh_options: {
  port: 4840
}

<<<<<<< HEAD
set :branch, 'feature/adler-test'
=======
set :branch, 'feature/develop-functional-analysis-tpa'
>>>>>>> 07ba73990ca0cbfb929a5b0466516888f300644c
set :rails_env, :development
