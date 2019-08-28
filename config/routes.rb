UnipeptWeb::Application.routes.draw do
  # cas auth
  devise_for :users

  # home page
  root :to => 'pages#home'

  # simple resources
  resources :posts
  resources :dataset_items
  resources :sequences, :only => [:show, :index]
  resources :organisms, :only => [:show, :index]

  # datasets
  # match 'datasets/database/:id' => 'datasets#database'
  # match 'datasets/pride/:id' => 'datasets#pride'
  resources :datasets do
    collection do
      get 'database/:id' => 'datasets#preload', :defaults => { :type => 'database' }
      get 'pride/:id' => 'datasets#preload', :defaults => { :type => 'pride' }
    end
  end

  scope :datasets, as: 'datasets' do
    match "sampledata", via: [:post], :to => "datasets#sampledata"
  end


  # General inforamtion
  scope :private_api, as: 'private_api' do
    match "goterms", via: [:get, :post], :to => "private_api#goterms"
    match "ecnumbers",     via: [:get, :post], :to => "private_api#ecnumbers"
    match "taxa",     via: [:get, :post], :to => "private_api#taxa"
  end

  # search
  get '/search/sequence', :to => 'sequences#search', :as => 'sequence_search'

  scope :mpa, as: 'mpa' do
    match "/",        via: [:get, :post], :to => "mpa#analyze"
    match "pept2data", via: [:get, :post], :to => "mpa#pept2data"
  end

  get '/sequences/:id/:equate_il', :to => 'sequences#show', :as => 'sequence_show'
  get '/search/single', :to => 'search#single'

  # pancore
  match '/peptidome/sequences/:proteome_id.:format', via: [:get, :post], :to => 'peptidome#get_sequence_ids_for_proteome', :constraints => { :proteome_id => /[0-z\._]+/ }
  match '/peptidome/unique_sequences', via: [:get, :post], :to => 'peptidome#get_unique_sequences'
  match '/peptidome/full_sequences', via: [:get, :post], :to => 'peptidome#get_sequences'
  match '/peptidome/full_proteins', via: [:get, :post], :to => 'peptidome#get_proteins'
  match '/peptidome/convert_peptides', via: [:get, :post], :to => 'peptidome#convert_peptides'
  match '/peptidome/get_lca', via: [:get, :post], :to => 'peptidome#get_lca'
  get '/peptidome', :to => 'peptidome#analyze', :as => 'pancore_analyze'
  get '/pancore', :to => 'peptidome#analyze'
  get '/peptidefinder', :to => 'peptidome#analyze', :as => 'peptide_finder', defaults: { tab: 'peptidefinder' }
  get '/peptidomeclustering', :to => 'peptidome#analyze', :as => 'peptidome_clustering', defaults: { tab: 'peptidomeclustering' }

  # simple pages
  get '/about',   :to => 'pages#about'
  get '/admin',   :to => 'pages#admin'
  get '/publications', :to => 'pages#publications'
  post '/mail',   :to => 'pages#mail'

  # generate png from svg
  post "/convert", :to => "imagemagick#convert"

  # downloads a file
  post "/download", :to => "download#download"

  # API namespace
  namespace :api, path: 'api/v1' do
    match 'pept2taxa' => "api#pept2taxa", via: [:get, :post]
    match 'pept2lca' => "api#pept2lca", via: [:get, :post]
    match 'taxa2lca' => 'api#taxa2lca', via: [:get, :post]
    match 'pept2prot' => 'api#pept2prot', via: [:get, :post]
    match 'pept2funct' => 'api#pept2funct', via: [:get, :post]
    match 'pept2ec' => 'api#pept2ec', via: [:get, :post]
    match 'pept2go' => 'api#pept2go', via: [:get, :post]
    match 'peptinfo' => 'api#peptinfo', via: [:get, :post]
    match 'taxonomy' => 'api#taxonomy', via: [:get, :post]
    match 'messages' => 'api#messages', via: [:get, :post]
  end

  # API docs
  namespace :api, path: "apidocs" do
    get "/",          :to => "apidocs#index",      :as => 'apidocs'
    get "pept2prot",  :to => "apidocs#pept2prot",  :as => 'apidocs/pept2prot'
    get "pept2taxa",  :to => "apidocs#pept2taxa",  :as => 'apidocs/pept2taxa'
    get "pept2lca",   :to => "apidocs#pept2lca",   :as => 'apidocs/pept2lca'
    get "taxa2lca",   :to => "apidocs#taxa2lca",   :as => 'apidocs/taxa2lca'
    get "pept2ec",    :to => "apidocs#pept2ec",    :as => 'apidocs/pept2ec'
    get 'pept2go',    :to => "apidocs#pept2go",    :as => 'apidocs/pept2go'
    get 'pept2funct', :to => "apidocs#pept2funct", :as => 'apidocs/pept2funct'
    get 'peptinfo',   :to => "apidocs#peptinfo",   :as => 'apidocs/peptinfo'
    get "taxonomy",   :to => "apidocs#taxonomy",   :as => 'apidocs/taxonomy'
  end

  # CLI docs
  namespace :api, path: "clidocs" do
    get "/",           :to => "clidocs#index",       :as => 'clidocs'
    get "casestudies", :to => "clidocs#casestudies", :as => 'clidocs/casestudies'
    get "casestudies/tpa", :to => "clidocs#casestudy_tpa", :as => 'clidocs/casestudy_tpa'
    get "casestudies/mpa", :to => "clidocs#casestudy_mpa", :as => 'clidocs/casestudy_mpa'
    get "casestudies/metagenomics", :to => "clidocs#casestudy_metagenomics", :as => 'clidocs/casestudy_metagenomics'
    get "prot2pept",   :to => "clidocs#prot2pept",   :as => 'clidocs/prot2pept'
    get "peptfilter",  :to => "clidocs#peptfilter",  :as => 'clidocs/peptfilter'
    get "uniprot",     :to => "clidocs#uniprot",     :as => 'clidocs/uniprot'
    get "pept2lca",    :to => "clidocs#pept2lca",    :as => 'clidocs/pept2lca'
    get "pept2prot",   :to => "clidocs#pept2prot",   :as => 'clidocs/pept2prot'
    get "pept2taxa",   :to => "clidocs#pept2taxa",   :as => 'clidocs/pept2taxa'
    get "pept2ec",     :to => "clidocs#pept2ec",     :as => 'clidocs/pept2ec'
    get "pept2go",     :to => "clidocs#pept2go",     :as => 'clidocs/pept2go'
    get "pept2funct",  :to => "clidocs#pept2funct",  :as => 'clidocs/pept2funct'
    get "peptinfo",    :to => "clidocs#peptinfo",    :as => 'clidocs/peptinfo'
    get "taxa2lca",    :to => "clidocs#taxa2lca",    :as => 'clidocs/taxa2lca'
    get "taxonomy",    :to => "clidocs#taxonomy",    :as => 'clidocs/taxonomy'
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
