class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :set_motd
  
  def set_motd
    file = Rails.root.join("public", "motd")
    @motd = File.read(file) if FileTest.exists?(file)
  end
end
