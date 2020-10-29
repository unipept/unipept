class Api::DesktopController < ApplicationController
  before_action :set_header
  before_action :set_sidebar_nav

  def index
    @title = 'Unipept Desktop - Getting started'
    @sidebar_name = 'Getting started'
    @sidebar_subnav = %w[Installation Updates]
  end

  def application_overview
    @title = 'Unipept Desktop - Application overview'
    @sidebar_name = 'Application overview'
    @sidebar_subnav = [
      'First time use',
      'Navigation overview'
    ]
  end

  def project_management
    @title = 'Unipept Desktop - Project management'
    @sidebar_name = 'Project management'
    @sidebar_subnav = [
      'Project structure',
      'Physical structure'
    ]
  end

  def settings
    @title = 'Unipept Desktop - Settings'
    @sidebar_name = 'Settings'
    @sidebar_subnav = [
      'Change endpoint',
      'Concurrency control'
    ]
  end

  private

  def set_sidebar_nav
    @sidebar_nav = [
      { name: 'Getting started',      path: api_desktop_path },
      { name: 'Application overview', path: api_desktop_application_overview_path },
      { name: 'Project management',   path: api_desktop_project_management_path },
      { name: 'Settings',             path: api_desktop_settings_path }
    ]
  end

  def set_header
    @header_class = 'desktop'
  end
end
