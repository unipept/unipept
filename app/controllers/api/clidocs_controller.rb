class Api::ClidocsController < ApplicationController

  before_filter :set_sidebar_nav
  before_filter :set_sidebar_subnav, only: []

  def index
    @title = "Unipept command line interface"
    @sidebar_name = "Overview"
  end

  private
  def set_sidebar_nav
    @sidebar_nav = [
      {:name => "Overview",  :path => api_clidocs_path}
    ]
  end

  def set_sidebar_subnav
    @sidebar_subnav = []
  end
end
