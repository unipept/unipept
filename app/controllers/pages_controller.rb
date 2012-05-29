class PagesController < ApplicationController
  
  def home
    @title = "Home"
    @datasets = Dataset.includes(:dataset_items).all
  end

  def about
    @title = "About"
  end

  def contact
    @title = "Contact"
  end
end
