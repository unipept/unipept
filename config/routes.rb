UnipeptWeb::Application.routes.draw do
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
  get '/pancore/sequences/:bioproject_id.:format', :to => 'pancorepeptidome#get_sequence_ids_for_bioproject', :constraints => { :bioproject_id => /[0-z\._]+/ }
  get '/pancore/genomes/species/:species_id.:format', :to => 'pancorepeptidome#get_genomes'
  post '/pancore/unique_sequences', :to => 'pancorepeptidome#get_unique_sequences'
  get '/pancore/full_sequences', :to => 'pancorepeptidome#get_sequences'
  get '/pancore', :to => 'pancorepeptidome#analyze', :as => 'pancore_analyze'
  get '/peptidefinder', :to => 'pancorepeptidome#analyze', :as => 'peptide_finder', defaults: { tab: 'peptidefinder' }
  get '/peptidomeclustering', :to => 'pancorepeptidome#analyze', :as => 'peptidome_clustering', defaults: { tab: 'peptidomeclustering' }

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

  # verbosity is needed to add namespace to controller
  get "cas/auth", :to => "cas#auth"
  get "cas/logout", :to => "cas#logout"
  get "cas/verify", :to => "cas#verify"

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
