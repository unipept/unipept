class Api::ApidocsController < ApplicationController
  before_action :set_header
  before_action :set_sidebar_nav
  before_action :set_sidebar_subnav, only: %i[pept2prot pept2taxa pept2lca pept2ec pept2go pept2interpro pept2funct peptinfo taxa2lca taxa2tree taxonomy]

  def index
    @title = 'Unipept API'
    @sidebar_name = 'Overview'
  end

  def pept2prot
    @title = 'pept2prot'
    @sidebar_name = 'pept2prot'
  end

  def pept2taxa
    @title = 'pept2taxa'
    @sidebar_name = 'pept2taxa'
  end

  def pept2lca
    @title = 'pept2lca'
    @sidebar_name = 'pept2lca'
  end

  def pept2ec
    @title = 'pept2ec'
    @sidebar_name = 'pept2ec'
  end

  def pept2go
    @title = 'pept2go'
    @sidebar_name = 'pept2go'
  end

  def pept2interpro
    @title = 'pept2interpro'
    @sidebar_name = 'pept2interpro'
  end

  def pept2funct
    @title = 'pept2funct'
    @sidebar_name = 'pept2funct'
  end

  def peptinfo
    @title = 'peptinfo'
    @sidebar_name = 'peptinfo'
  end

  def taxa2lca
    @title = 'taxa2lca'
    @sidebar_name = 'taxa2lca'
  end

  def taxa2tree
    @title = 'taxa2tree'
    @sidebar_name = 'taxa2tree'
  end

  def taxonomy
    @title = 'taxonomy'
    @sidebar_name = 'taxonomy'
  end

  private

  def set_sidebar_nav
    @sidebar_nav = [
      { name: 'Overview',  path: api_apidocs_path },
      { name: 'pept2prot', path: api_apidocs_pept2prot_path },
      { name: 'pept2taxa', path: api_apidocs_pept2taxa_path },
      { name: 'pept2lca',  path: api_apidocs_pept2lca_path },
      { name: 'pept2ec', path: api_apidocs_pept2ec_path },
      { name: 'pept2go', path: api_apidocs_pept2go_path },
      { name: 'pept2interpro', path: api_apidocs_pept2interpro_path },
      { name: 'pept2funct', path: api_apidocs_pept2funct_path },
      { name: 'peptinfo', path: api_apidocs_peptinfo_path },
      { name: 'taxa2lca',  path: api_apidocs_taxa2lca_path },
      { name: 'taxa2tree', path: api_apidocs_taxa2tree_path },
      { name: 'taxonomy',  path: api_apidocs_taxonomy_path }
    ]
  end

  def set_sidebar_subnav
    @sidebar_subnav = ['Request', 'Response', 'Parameters', 'Examples', 'Try it']
  end

  def set_header
    @header_class = 'API'
  end
end
