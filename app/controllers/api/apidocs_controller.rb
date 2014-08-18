class Api::ApidocsController < ApplicationController

  def index
    @title = "Unipept API"
  end

  def pept2prot
    @title = "pept2prot"
  end

  def pept2taxa
    @title = "pept2taxa"
  end

  def pept2lca
    @title = "pept2lca"
  end

  def taxa2lca
    @title = "taxa2lca"
  end
end