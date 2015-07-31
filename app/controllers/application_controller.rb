class ApplicationController < ActionController::Base
  protect_from_forgery
  before_action :set_motd
  before_action :my_auth

  before_action :disable_website

  def set_motd
    file = Rails.root.join('public', 'motd')
    @motd = File.read(file) if FileTest.exists?(file)
  end

  protected

  def disable_website
    redirect_to "http://unipept.ugent.be" + api_apidocs_path
  end

  def authorize
    return if user_signed_in? && current_user.admin?

    flash[:error] = 'Please log in to use this feature'
    redirect_to root_url
  end

  # if authentication is disabled, sign is with guest user
  def my_auth
    return if Rails.application.config.unipept_enable_auth

    u = User.find_by_username('guest')
    sign_in(:user, u)
  end
end
