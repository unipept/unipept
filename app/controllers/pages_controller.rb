class PagesController < ApplicationController
  before_filter :authorize, :only => [:admin]
  
  def home
    @title = "Home"
    @datasets = Dataset.includes(:dataset_items).all
    @post = Post.last
  end

  def about
    @title = "About"
  end

  def contact
    @title = "Contact"
  end

  def admin
    @title = "Admin"

    # progressbar stuff
    file = Rails.root.join("public", "progress")
    if FileTest.exists?(file)
      content = File.read(file)
      content = content.gsub(/#/,"\n").lines.to_a
      @progress_name = content[0]
      @progress_percentage = content[1]
    end
  end
end
