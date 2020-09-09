class Api::UmgapController < ApplicationController
  before_action :set_header
  before_action :set_sidebar_nav
  before_action :set_case_subnav, only: %i[casestudies casestudy_metagenomics]

  def index
    @title = ' Unipept MetaGenomics Analysis Pipeline'
    @sidebar_name = 'Overview'
    @sidebar_subnav = %w[Installation Updates Configuration]
  end

  def casestudies
    @title = 'UMGAP case studies'
    @sidebar_name = 'Case studies'
    @study = ''
  end

  def casestudy_metagenomics
    @title = 'Case study: metagenomics'
    @sidebar_name = 'Case studies'
    @study = 'Metagenomics'
  end

  private

  def set_sidebar_nav
    @sidebar_nav = [
      { name: 'Overview',      path: api_umgap_path },
      { name: 'Case studies',  path: api_umgap_casestudies_path },
      { name: 'fastq2fasta',   path: api_umgap_fastq2fasta_path },
      { name: 'translate',     path: api_umgap_translate_path },
      { name: 'prot2tryp',     path: api_umgap_prot2tryp_path },
      { name: 'prot2kmer',     path: api_umgap_prot2kmer_path },
      { name: 'filter',        path: api_umgap_filter_path },
      { name: 'pept2lca',      path: api_umgap_pept2lca_path },
      { name: 'prot2tryp2lca', path: api_umgap_prot2tryp2lca_path },
      { name: 'prot2kmer2lca', path: api_umgap_prot2kmer2lca_path },
      { name: 'bestof',        path: api_umgap_bestof_path },
      { name: 'seedextend',    path: api_umgap_seedextend_path },
      { name: 'uniq',          path: api_umgap_uniq_path },
      { name: 'taxa2agg',      path: api_umgap_taxa2agg_path },
      { name: 'snaptaxon',     path: api_umgap_snaptaxon_path },
      { name: 'taxa2freq',     path: api_umgap_taxa2freq_path },
      { name: 'taxa2tree',     path: api_umgap_taxa2tree_path },
      { name: 'taxonomy',      path: api_umgap_taxonomy_path },
      { name: 'splitkmers',    path: api_umgap_splitkmers_path },
      { name: 'joinkmers',     path: api_umgap_joinkmers_path },
      { name: 'buildindex',    path: api_umgap_buildindex_path },
      { name: 'printindex',    path: api_umgap_printindex_path }
    ]
  end

  def set_case_subnav
    @sidebar_subnav = [['Metagenomics', api_umgap_casestudy_metagenomics_path]]
  end

  def set_header
    @header_class = 'metagenomics'
  end
end
