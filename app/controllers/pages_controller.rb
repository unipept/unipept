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
      file = File.open(file, 'r')
      @progress = file.readlines.to_a.map{ |line| line.strip.gsub(/#/,"\n").lines.to_a }
    end
  end
end
