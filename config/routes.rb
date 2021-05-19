UnipeptWeb::Application.routes.draw do
  # cas auth
  devise_for :users

  # home page
  root to: 'pages#home'

  # simple resources
  resources :posts
  resources :dataset_items
  resources :sequences, only: %i[show index]
  resources :organisms, only: %i[show index]

  # datasets
  # match 'datasets/database/:id' => 'datasets#database'
  # match 'datasets/pride/:id' => 'datasets#pride'
  resources :datasets do
    collection do
      get 'database/:id' => 'datasets#preload', :defaults => { type: 'database' }
      get 'pride/:id' => 'datasets#preload', :defaults => { type: 'pride' }
    end
  end

  scope :datasets, as: 'datasets' do
    match 'sampledata', via: [:post], to: 'datasets#sampledata'
  end

  # General inforamtion
  scope :private_api, as: 'private_api' do
    match "/*path", via: [:options], :to => "handle_options#handle_options_request"
    match "goterms", via: [:get, :post], :to => "private_api#goterms"
    match "ecnumbers",     via: [:get, :post], :to => "private_api#ecnumbers"
    match "taxa",     via: [:get, :post], :to => "private_api#taxa"
    match "interpros", via: [:get, :post], :to => "private_api#interpros"
    match "proteins", via: [:get, :post], :to => "private_api#proteins"
    match "metadata", via: [:get, :post], :to => "private_api#metadata"
  end

  # search
  get '/search/sequence', to: 'sequences#search', as: 'sequence_search'

  scope :export, as: 'export' do
    match '/', via: %i[get post], to: 'mpa#analyze'
  end

  scope :mpa, as: 'mpa' do
    match '/*path', via: [:options], to: 'handle_options#handle_options_request'
    match '/', via: %i[get post], to: 'mpa#analyze'
    match 'pept2data', via: %i[get post], to: 'mpa#pept2data'
  end

  get '/sequences/:id/:equate_il', to: 'sequences#show', as: 'sequence_show'
  get '/search/single', to: 'search#single'

  # pancore
  match '/peptidome/sequences/:proteome_id.:format', via: %i[get post], to: 'peptidome#get_sequence_ids_for_proteome', constraints: { proteome_id: /[0-z\._]+/ }
  match '/peptidome/unique_sequences', via: %i[get post], to: 'peptidome#get_unique_sequences'
  match '/peptidome/full_sequences', via: %i[get post], to: 'peptidome#get_sequences'
  match '/peptidome/full_proteins', via: %i[get post], to: 'peptidome#get_proteins'
  match '/peptidome/convert_peptides', via: %i[get post], to: 'peptidome#convert_peptides'
  match '/peptidome/get_lca', via: %i[get post], to: 'peptidome#get_lca'
  get '/peptidome', to: 'peptidome#analyze', as: 'pancore_analyze'
  get '/pancore', to: 'peptidome#analyze'
  get '/peptidefinder', to: 'peptidome#analyze', as: 'peptide_finder', defaults: { tab: 'peptidefinder' }
  get '/peptidomeclustering', to: 'peptidome#analyze', as: 'peptidome_clustering', defaults: { tab: 'peptidomeclustering' }

  # simple pages
  get '/about',   to: 'pages#about'
  get '/admin',   to: 'pages#admin'
  get '/publications', to: 'pages#publications'
  post '/mail', to: 'pages#mail'

  # generate png from svg
  post '/convert', to: 'imagemagick#convert'

  # downloads a file
  post '/download', to: 'download#download'

  # API namespace
  namespace :api, path: 'api/v1' do
    match 'pept2taxa' => "api#pept2taxa", via: %i[get post]
    match 'pept2lca' => "api#pept2lca", via: %i[get post]
    match 'taxa2lca' => 'api#taxa2lca', via: %i[get post]
    match 'pept2prot' => 'api#pept2prot', via: %i[get post]
    match 'pept2funct' => 'api#pept2funct', via: %i[get post]
    match 'pept2ec' => 'api#pept2ec', via: %i[get post]
    match 'pept2go' => 'api#pept2go', via: %i[get post]
    match 'pept2interpro' => 'api#pept2interpro', via: %i[get post]
    match 'taxa2tree' => 'api#taxa2tree', via: %i[get post]
    match 'peptinfo' => 'api#peptinfo', via: %i[get post]
    match 'taxonomy' => 'api#taxonomy', via: %i[get post]
    match 'messages' => 'api#messages', via: %i[get post]
  end

  # API docs
  namespace :api, path: 'apidocs' do
    get '/',          to: 'apidocs#index',      as: 'apidocs'
    get 'pept2prot',  to: 'apidocs#pept2prot',  as: 'apidocs/pept2prot'
    get 'pept2taxa',  to: 'apidocs#pept2taxa',  as: 'apidocs/pept2taxa'
    get 'pept2lca',   to: 'apidocs#pept2lca',   as: 'apidocs/pept2lca'
    get 'taxa2lca',   to: 'apidocs#taxa2lca',   as: 'apidocs/taxa2lca'
    get 'taxa2tree',  to: 'apidocs#taxa2tree',  as: 'apidocs/taxa2tree'
    get 'pept2ec',    to: 'apidocs#pept2ec',    as: 'apidocs/pept2ec'
    get 'pept2go',    to: 'apidocs#pept2go',    as: 'apidocs/pept2go'
    get 'pept2interpro', to: 'apidocs#pept2interpro', as: 'apidocs/pept2interpro'
    get 'pept2funct', to: 'apidocs#pept2funct', as: 'apidocs/pept2funct'
    get 'peptinfo',   to: 'apidocs#peptinfo',   as: 'apidocs/peptinfo'
    get 'taxonomy',   to: 'apidocs#taxonomy',   as: 'apidocs/taxonomy'
  end

  # CLI docs
  namespace :api, path: 'clidocs' do
    get '/',           to: 'clidocs#index',       as: 'clidocs'
    get 'casestudies', to: 'clidocs#casestudies', as: 'clidocs/casestudies'
    get 'casestudies/tpa', to: 'clidocs#casestudy_tpa', as: 'clidocs/casestudy_tpa'
    get 'casestudies/mpa', to: 'clidocs#casestudy_mpa', as: 'clidocs/casestudy_mpa'
    get 'casestudies/metagenomics', to: 'clidocs#casestudy_metagenomics', as: 'clidocs/casestudy_metagenomics'
    get 'prot2pept',   to: 'clidocs#prot2pept',   as: 'clidocs/prot2pept'
    get 'peptfilter',  to: 'clidocs#peptfilter',  as: 'clidocs/peptfilter'
    get 'uniprot',     to: 'clidocs#uniprot',     as: 'clidocs/uniprot'
    get 'pept2lca',    to: 'clidocs#pept2lca',    as: 'clidocs/pept2lca'
    get 'pept2prot',   to: 'clidocs#pept2prot',   as: 'clidocs/pept2prot'
    get 'pept2taxa',   to: 'clidocs#pept2taxa',   as: 'clidocs/pept2taxa'
    get 'pept2ec',     to: 'clidocs#pept2ec',     as: 'clidocs/pept2ec'
    get 'pept2go',     to: 'clidocs#pept2go',     as: 'clidocs/pept2go'
    get 'pept2funct',  to: 'clidocs#pept2funct',  as: 'clidocs/pept2funct'
    get 'peptinfo',    to: 'clidocs#peptinfo',    as: 'clidocs/peptinfo'
    get 'taxa2lca',    to: 'clidocs#taxa2lca',    as: 'clidocs/taxa2lca'
    get 'taxa2tree',   to: 'clidocs#taxa2tree',   as: 'clidocs/taxa2tree'
    get 'taxonomy',    to: 'clidocs#taxonomy',    as: 'clidocs/taxonomy'
  end

  # UMGAP docs
  namespace :api, path: 'umgap' do
    get '/',                        to: 'umgap#index',                   as: 'umgap'
    get 'casestudies',              to: 'umgap#casestudies',             as: 'umgap/casestudies'
    get 'casestudies/advanced',     to: 'umgap#casestudy_advanced',      as: 'umgap/casestudy_advanced'
    get 'casestudies/basic',        to: 'umgap#casestudy_basic',         as: 'umgap/casestudy_basic'
    get 'casestudies/comparative',  to: 'umgap#casestudy_comparative',   as: 'umgap/casestudy_comparative'
    get 'fastq2fasta',              to: 'umgap#fastq2fasta',             as: 'umgap/fastq2fasta'
    get 'translate',                to: 'umgap#translate',               as: 'umgap/translate'
    get 'prot2tryp',                to: 'umgap#prot2tryp',               as: 'umgap/prot2tryp'
    get 'prot2kmer',                to: 'umgap#prot2kmer',               as: 'umgap/prot2kmer'
    get 'filter',                   to: 'umgap#filter',                  as: 'umgap/filter'
    get 'pept2lca',                 to: 'umgap#pept2lca',                as: 'umgap/pept2lca'
    get 'prot2tryp2lca',            to: 'umgap#prot2tryp2lca',           as: 'umgap/prot2tryp2lca'
    get 'prot2kmer2lca',            to: 'umgap#prot2kmer2lca',           as: 'umgap/prot2kmer2lca'
    get 'bestof',                   to: 'umgap#bestof',                  as: 'umgap/bestof'
    get 'seedextend',               to: 'umgap#seedextend',              as: 'umgap/seedextend'
    get 'uniq',                     to: 'umgap#uniq',                    as: 'umgap/uniq'
    get 'taxa2agg',                 to: 'umgap#taxa2agg',                as: 'umgap/taxa2agg'
    get 'snaptaxon',                to: 'umgap#snaptaxon',               as: 'umgap/snaptaxon'
    get 'taxa2freq',                to: 'umgap#taxa2freq',               as: 'umgap/taxa2freq'
    get 'taxa2tree',                to: 'umgap#taxa2tree',               as: 'umgap/taxa2tree'
    get 'taxonomy',                 to: 'umgap#taxonomy',                as: 'umgap/taxonomy'
    get 'splitkmers',               to: 'umgap#splitkmers',              as: 'umgap/splitkmers'
    get 'joinkmers',                to: 'umgap#joinkmers',               as: 'umgap/joinkmers'
    get 'buildindex',               to: 'umgap#buildindex',              as: 'umgap/buildindex'
    get 'printindex',               to: 'umgap#printindex',              as: 'umgap/printindex'
  end

  # desktop docs
  namespace :api, path: 'desktop' do
    get '/',                    to: 'desktop#index',                 as: 'desktop'
    get 'application_overview', to: 'desktop#application_overview',  as: 'desktop/application_overview'
    get 'project_management',   to: 'desktop#project_management',    as: 'desktop/project_management'
    get 'settings',             to: 'desktop#settings',              as: 'desktop/settings'
  end

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => "welcome#index"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
