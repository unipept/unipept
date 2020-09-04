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
      { name: 'Overview',            path: api_umgap_path },
      { name: 'Case studies',        path: api_umgap_casestudies_path },
      { name: 'umgap fastq2fasta',   path: api_umgap_fastq2fasta_path },
      { name: 'umgap translate',     path: api_umgap_translate_path },
      { name: 'umgap prot2pept',     path: api_umgap_prot2pept_path },
      { name: 'umgap prot2kmer',     path: api_umgap_prot2kmer_path },
      { name: 'umgap filter',        path: api_umgap_filter_path },
      { name: 'umgap pept2lca',      path: api_umgap_pept2lca_path },
      { name: 'umgap prot2tryp2lca', path: api_umgap_prot2tryp2lca_path },
      { name: 'umgap prot2kmer2lca', path: api_umgap_prot2kmer2lca_path },
      { name: 'umgap bestof',        path: api_umgap_bestof_path },
      { name: 'umgap seedextend',    path: api_umgap_seedextend_path },
      { name: 'umgap uniq',          path: api_umgap_uniq_path },
      { name: 'umgap taxa2agg',      path: api_umgap_taxa2agg_path },
      { name: 'umgap snaptaxon',     path: api_umgap_snaptaxon_path },
      { name: 'umgap report',        path: api_umgap_report_path },
      { name: 'umgap visualize',     path: api_umgap_visualize_path },
      { name: 'umgap taxonomy',      path: api_umgap_taxonomy_path },
      { name: 'umgap splitkmers',    path: api_umgap_splitkmers_path },
      { name: 'umgap joinkmers',     path: api_umgap_joinkmers_path },
      { name: 'umgap buildindex',    path: api_umgap_buildindex_path },
      { name: 'umgap printindex',    path: api_umgap_printindex_path }
    ]
  end

  def set_case_subnav
    @sidebar_subnav = [['Metagenomics', api_umgap_casestudy_metagenomics_path]]
  end

  def set_header
    @header_class = 'metagenomics'
  end
end
