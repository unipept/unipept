UnipeptWeb::Application.routes.draw do

  resources :posts

  resources :datasets
  resources :dataset_items
  resources :sequences, :only => [:show, :index] do   
  end
  resources :organisms, :only => [:show, :index]
  
  root :to => 'pages#home'
  
  match '/search/sequence', :to => 'sequences#search', :as => 'sequence_search'
  match '/search/sequences', :to => 'sequences#multi_search', :as => 'sequence_multi_search'
	match 'sequences/:id/:equate_il', :to => 'sequences#show'

    
  match '/contact', :to => 'pages#contact'
  match '/about',   :to => 'pages#about'
  
  match "/convert", :to => "imagemagick#convert"
  
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
