class Api::ClidocsController < ApplicationController
  before_filter :set_sidebar_nav
  before_filter :set_sidebar_subnav, only: [:pept2lca, :pept2prot, :pept2taxa]

  def index
    @title = 'Unipept command line interface'
    @sidebar_name = 'Overview'
    @sidebar_subnav = %w(Installation Updates Configuration)
  end

  def pept2lca
    @title = 'The unipept pept2lca command'
    @sidebar_name = 'unipept pept2lca'
  end

  def pept2prot
    @title = 'The unipept pept2prot command'
    @sidebar_name = 'unipept pept2prot'
  end

  def pept2taxa
    @title = 'The unipept pept2taxa command'
    @sidebar_name = 'unipept pept2taxa'
  end

  private

  def set_sidebar_nav
    @sidebar_nav = [
      { name: 'Overview',           path: api_clidocs_path },
      { name: 'uniprot',            path: api_clidocs_pept2lca_path },
      { name: 'prot2pept',          path: api_clidocs_pept2lca_path },
      { name: 'peptfilter',         path: api_clidocs_pept2lca_path },
      { name: 'unipept pept2lca',   path: api_clidocs_pept2lca_path },
      { name: 'unipept pept2prot',  path: api_clidocs_pept2prot_path },
      { name: 'unipept pept2taxa',  path: api_clidocs_pept2taxa_path },
      { name: 'unipept taxa2lca',   path: api_clidocs_pept2lca_path },
      { name: 'unipept taxonomy',   path: api_clidocs_pept2lca_path }
    ]
  end

  def set_sidebar_subnav
    @sidebar_subnav = %w(Input Output Fasta Options)
  end
end
