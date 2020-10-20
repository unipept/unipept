class Api::DesktopController < ApplicationController
  before_action :set_header
  before_action :set_sidebar_nav


  def index
    @title = 'Unipept Desktop'
    @sidebar_name = 'Overview'
    @sidebar_subnav = %w[Installation Updates]
  end


  private
  def set_sidebar_nav
    @sidebar_nav = [
        { name: 'Overview',           path: api_desktop_path }
    ]
  end

  def set_header
    @header_class = 'desktop'
  end
end
