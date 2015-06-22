class Api::ClidocsController < ApplicationController
  before_filter :set_sidebar_nav
  before_filter :set_sidebar_subnav, only: []

  def index
    @title = 'Unipept command line interface'
    @sidebar_name = 'Overview'
    @sidebar_subnav = %w(Installation Configuration)
  end

  private

  def set_sidebar_nav
    @sidebar_nav = [
      { name: 'Overview',  path: api_clidocs_path },
      { name: 'uniprot',  path: api_clidocs_path },
      { name: 'peptfilter',  path: api_clidocs_path },
      { name: 'unipept pept2lca',  path: api_clidocs_path },
      { name: 'unipept pept2prot',  path: api_clidocs_path },
      { name: 'unipept pept2taxa',  path: api_clidocs_path },
      { name: 'unipept taxa2lca',  path: api_clidocs_path },
      { name: 'unipept taxonomy',  path: api_clidocs_path }
    ]
  end

  def set_sidebar_subnav
    @sidebar_subnav = []
  end
end
