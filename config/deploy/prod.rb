set :stage, :prod

set :rvm_type, :user

set :default_environment, {
  'PATH' => "/home/unipept/.rvm/gems/ruby-2.7.1/bin:/home/unipept/.rvm/gems/ruby-2.7.1@global/bin:/usr/share/rvm/rubies/ruby-2.7.1/bin:$PATH",
  'RUBY_VERSION' => 'ruby-2.7.1',
  'GEM_HOME'     => '/home/unipept/.rvm/gems/ruby-2.7.1',
  'GEM_PATH'     => '/home/unipept/.rvm/gems/ruby-2.7.1:/home/unipept/.rvm/gems/ruby-2.7.1@global',
}

# don't specify db as it's not needed for unipept
server 'unipeptweb.ugent.be', user: 'unipept', roles: %i[web app], ssh_options: {
  port: 22
}

set :branch, 'production'
set :rails_env, :production

namespace :deploy do
  before :publishing, :asset_stuff do
    on roles :all do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :rake, 'assets:precompile'
          execute :rake, 'assets:nodigest'
        end
      end
    end
  end
end
