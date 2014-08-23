class Api::ApidocsController < ApplicationController

  before_filter :set_sidebar_nav
  before_filter :set_sidebar_subnav, only: [:pept2prot, :pept2taxa, :pept2lca, :taxa2lca, :taxonomy]

  def set_sidebar_nav
    @sidebar_nav = [
      {:name => "Overview",  :path => api_apidocs_path},
      {:name => "pept2prot", :path => api_apidocs_pept2prot_path},
      {:name => "pept2taxa", :path => api_apidocs_pept2taxa_path},
      {:name => "pept2lca",  :path => api_apidocs_pept2lca_path},
      {:name => "taxa2lca",  :path => api_apidocs_taxa2lca_path},
      {:name => "taxonomy",  :path => api_apidocs_taxonomy_path}
    ]
  end

  def set_sidebar_subnav
    @sidebar_subnav = ["Request", "Response", "Parameters", "Examples"]
  end

  def index
    @title = "Unipept API"
    @sidebar_name = "Overview"
  end

  def pept2prot
    @title = "pept2prot"
    @sidebar_name = "pept2prot"
  end

  def pept2taxa
    @title = "pept2taxa"
    @sidebar_name = "pept2taxa"
  end

  def pept2lca
    @title = "pept2lca"
    @sidebar_name = "pept2lca"
  end

  def taxa2lca
    @title = "taxa2lca"
    @sidebar_name = "taxa2lca"
  end

  def taxonomy
    @title = "taxonomy"
    @sidebar_name = "taxonomy"
  end
end
