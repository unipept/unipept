set :stage, :feat

# don't specify db as it's not needed for unipept
server "scruffy.ugent.be", user: 'bmesuere', roles: [:web, :app], ssh_options: {
  port: 4840,
}

<<<<<<< Updated upstream
set :branch, 'feature/api-pept2prot2'
=======
set :branch, 'frankenbuild'
>>>>>>> Stashed changes
set :rails_env, :development
