class Api::ClidocsController < ApplicationController
  before_filter :set_sidebar_nav
  before_filter :set_sidebar_subnav, only: [:pept2lca]

  def index
    @title = 'Unipept command line interface'
    @sidebar_name = 'Overview'
    @sidebar_subnav = %w(Installation Configuration)
  end

  def pept2lca
    @title = 'The unipept pept2lca command'
    @sidebar_name = 'unipept pept2lca'
  end

  private

  def set_sidebar_nav
    @sidebar_nav = [
      { name: 'Overview',  path: api_clidocs_path },
      { name: 'uniprot',  path: api_clidocs_pept2lca_path },
      { name: 'peptfilter',  path: api_clidocs_pept2lca_path },
      { name: 'unipept pept2lca',  path: api_clidocs_pept2lca_path },
      { name: 'unipept pept2prot',  path: api_clidocs_pept2lca_path },
      { name: 'unipept pept2taxa',  path: api_clidocs_pept2lca_path },
      { name: 'unipept taxa2lca',  path: api_clidocs_pept2lca_path },
      { name: 'unipept taxonomy',  path: api_clidocs_pept2lca_path }
    ]
  end

  def set_sidebar_subnav
    @sidebar_subnav = %w(Usage Options Examples)
  end
end
