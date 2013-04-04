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
      match 'database/:id' => 'datasets#preload', :defaults => { :type => 'database' }
      match 'pride/:id' => 'datasets#preload', :defaults => { :type => 'pride' }
    end
  end

  # search
  match '/search/sequence', :to => 'sequences#search', :as => 'sequence_search'
  match '/search/sequences', :to => 'sequences#multi_search', :as => 'sequence_multi_search'

  match '/sequences/:id/:equate_il', :to => 'sequences#show'

  # pancore
  match '/pancore/sequences/:sequence_id.:format', :to => 'pancoreproteome#sequence_ids',  :constraints => { :sequence_id => /[0-z\._]+/ }
  match '/pancore(/:species_id)', :to => 'pancoreproteome#analyze', :as => 'pancore_analyze'

  # simple pages
  match '/contact', :to => 'pages#contact'
  match '/about',   :to => 'pages#about'
  match '/admin',   :to => 'pages#admin'

  # generate png from svg
  match "/convert", :to => "imagemagick#convert"

  # load pride dataset from webservice
  match '/pride/:id', :to => 'pride#load'

  # verbosity is needed to add namespace to controller
  get "cas/auth", :to => "cas#auth"
  get "cas/logout", :to => "cas#logout"
  match "cas/verify", :to => "cas#verify"

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
