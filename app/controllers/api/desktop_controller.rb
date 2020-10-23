class Api::DesktopController < ApplicationController
  before_action :set_header
  before_action :set_sidebar_nav


  def index
    @title = 'Unipept Desktop'
    @sidebar_name = 'Overview'
    @sidebar_subnav = [
        'Installation',
        'Updates',
        'Application overview'
    ]
  end

  def home
    @title = 'Unipept Desktop Home'
    @sidebar_name = 'Home'
    @sidebar_subnav = [
        'First time use'
    ]
  end

  def single_assay_analysis
    @title = 'Unipept Desktop Single Assay Analysis'
    @sidebar_name = 'Single assay analysis'
  end

  private
  def set_sidebar_nav
    @sidebar_nav = [
        { name: 'Overview',                path: api_desktop_path },
        { name: 'Home',                    path: api_desktop_home_path },
        { name: 'Single assay analysis',   path: api_desktop_ssa_path }
    ]
  end

  def set_header
    @header_class = 'desktop'
  end
end
