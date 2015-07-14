class Api::ClidocsController < ApplicationController
  before_filter :set_sidebar_nav
  before_filter :set_sidebar_subnav, only: [:pept2lca, :pept2prot, :pept2taxa, :taxa2lca, :taxonomy, :uniprot, :prot2pept, :peptfilter]
  before_filter :set_case_subnav, only: [:casestudies, :casestudy_tpa, :casestudy_mpa]

  def index
    @title = 'Unipept command line interface'
    @sidebar_name = 'Overview'
    @sidebar_subnav = %w(Installation Updates Configuration)
  end

  def casestudies
    @title = 'Unipept command line interface case studies'
    @sidebar_name = 'Case studies'
    @study = ''
  end

  def casestudy_tpa
    @title = 'Case study: tryptic peptide'
    @sidebar_name = 'Case studies'
    @study = 'Tryptic peptide'
  end

  def casestudy_mpa
    @title = 'Case study: metaproteomics data'
    @sidebar_name = 'Case studies'
    @study = 'Metaproteomics data'
  end

  def casestudy_metagenomics
    @title = 'Case study: metagenomics'
    @sidebar_name = 'Case studies'
    @study = 'Metagenomics'
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

  def taxa2lca
    @title = 'The unipept taxa2lca command'
    @sidebar_name = 'unipept taxa2lca'
    @sidebar_subnav.delete('Fasta')
  end

  def taxonomy
    @title = 'The unipept taxonomy command'
    @sidebar_name = 'unipept taxonomy'
  end

  def uniprot
    @title = 'The uniprot command'
    @sidebar_name = 'uniprot'
    @sidebar_subnav.delete('Fasta')
  end

  def prot2pept
    @title = 'The prot2pept command'
    @sidebar_name = 'prot2pept'
  end

  def peptfilter
    @title = 'The peptfilter command'
    @sidebar_name = 'peptfilter'
  end

  private

  def set_sidebar_nav
    @sidebar_nav = [
      { name: 'Overview',           path: api_clidocs_path },
      { name: 'Case studies',       path: api_clidocs_casestudies_path },
      { name: 'uniprot',            path: api_clidocs_uniprot_path },
      { name: 'prot2pept',          path: api_clidocs_prot2pept_path },
      { name: 'peptfilter',         path: api_clidocs_peptfilter_path },
      { name: 'unipept pept2lca',   path: api_clidocs_pept2lca_path },
      { name: 'unipept pept2prot',  path: api_clidocs_pept2prot_path },
      { name: 'unipept pept2taxa',  path: api_clidocs_pept2taxa_path },
      { name: 'unipept taxa2lca',   path: api_clidocs_taxa2lca_path },
      { name: 'unipept taxonomy',   path: api_clidocs_taxonomy_path }
    ]
  end

  def set_sidebar_subnav
    @sidebar_subnav = %w(Input Output Fasta Options)
  end

  def set_case_subnav
    @sidebar_subnav = [['Tryptic peptide', api_clidocs_casestudy_tpa_path], ['Metaproteomics data', api_clidocs_casestudy_mpa_path]]
  end
end
