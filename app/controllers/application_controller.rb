class ApplicationController < ActionController::Base
  protect_from_forgery
  before_action :set_motd
  before_action :my_auth

  def set_motd
    file = Rails.root.join("public", "motd")
    @motd = File.read(file) if FileTest.exists?(file)
  end

  protected

  def authorize
    unless user_signed_in? && current_user.is_admin?
      flash[:error] = "Please log in to use this feature"
      redirect_to root_url
    end
  end

  def my_auth
    # if authentication is disabled, sign is with guest user
    unless Rails.application.config.unipept_enable_auth
      u = User.find_by_username("guest")
      sign_in(:user, u)
    end
  end
end
