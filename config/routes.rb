UnipeptWeb::Application.routes.draw do
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

  # search
  get '/search/sequence', :to => 'sequences#search', :as => 'sequence_search'
  post '/search/sequences', :to => 'sequences#multi_search', :as => 'sequence_multi_search'

  get '/sequences/:id/:equate_il', :to => 'sequences#show'
  get '/search/single', :to => 'search#single'

  # pancore
  match '/peptidome/sequences/:bioproject_id.:format', via: [:get, :post], :to => 'peptidome#get_sequence_ids_for_bioproject', :constraints => { :bioproject_id => /[0-z\._]+/ }
  match '/peptidome/genomes/species/:species_id.:format', via: [:get, :post], :to => 'peptidome#get_genomes'
  match '/peptidome/unique_sequences', via: [:get, :post], :to => 'peptidome#get_unique_sequences'
  match '/peptidome/full_sequences', via: [:get, :post], :to => 'peptidome#get_sequences'
  match '/peptidome/convert_peptides', via: [:get, :post], :to => 'peptidome#convert_peptides'
  get '/peptidome', :to => 'peptidome#analyze', :as => 'pancore_analyze'
  get '/peptidefinder', :to => 'peptidome#analyze', :as => 'peptide_finder', defaults: { tab: 'peptidefinder' }
  get '/peptidomeclustering', :to => 'peptidome#analyze', :as => 'peptidome_clustering', defaults: { tab: 'peptidomeclustering' }

  # simple pages
  get '/contact', :to => 'pages#contact'
  get '/about',   :to => 'pages#about'
  get '/admin',   :to => 'pages#admin'

  # generate png from svg
  post "/convert", :to => "imagemagick#convert"

  # downloads a file
  post "/download", :to => "download#download"

  # load pride dataset from webservice
  get '/pride/:id', :to => 'pride#load'

  # API namespace
  namespace :api, path: 'api/v1' do
    post 'single' => "api#single"
    post 'lca' => "api#lca"
    post 'taxa2lca' => 'api#taxa2lca'
    post 'pept2pro' => 'api#pept2pro'
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
