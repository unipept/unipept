class Api::UmgapController < ApplicationController
  before_action :set_header
  before_action :set_sidebar_nav
  before_action :set_case_subnav, only: %i[casestudies casestudy_metagenomics]

  def index
    @title = 'Unipept MetaGenomics Analysis Pipeline'
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

  def fastq2fasta
    @title = 'The umgap fastq2fasta command'
    @sidebar_name = 'fastq2fasta'
  end

  def translate
    @title = 'The umgap translate command'
    @sidebar_name = 'translate'
  end

  def prot2tryp
    @title = 'The umgap prot2tryp command'
    @sidebar_name = 'prot2tryp'
  end

  def prot2kmer
    @title = 'The umgap prot2kmer command'
    @sidebar_name = 'prot2kmer'
  end

  def filter
    @title = 'The umgap filter command'
    @sidebar_name = 'filter'
  end

  def pept2lca
    @title = 'The umgap pept2lca command'
    @sidebar_name = 'pept2lca'
  end

  def prot2tryp2lca
    @title = 'The umgap prot2tryp2lca command'
    @sidebar_name = 'prot2tryp2lca'
  end

  def prot2kmer2lca
    @title = 'The umgap prot2kmer2lca command'
    @sidebar_name = 'prot2kmer2lca'
  end

  def bestof
    @title = 'The umgap bestof command'
    @sidebar_name = 'bestof'
  end

  def seedextend
    @title = 'The umgap seedextend command'
    @sidebar_name = 'seedextend'
  end

  def uniq
    @title = 'The umgap uniq command'
    @sidebar_name = 'uniq'
  end

  def taxa2agg
    @title = 'The umgap taxa2agg command'
    @sidebar_name = 'taxa2agg'
  end

  def snaptaxon
    @title = 'The umgap snaptaxon command'
    @sidebar_name = 'snaptaxon'
  end

  def taxa2freq
    @title = 'The umgap taxa2freq command'
    @sidebar_name = 'taxa2freq'
  end

  def taxa2tree
    @title = 'The umgap taxa2tree command'
    @sidebar_name = 'taxa2tree'
  end

  def taxonomy
    @title = 'The umgap taxonomy command'
    @sidebar_name = 'taxonomy'
  end

  def splitkmers
    @title = 'The umgap splitkmers command'
    @sidebar_name = 'splitkmers'
  end

  def joinkmers
    @title = 'The umgap joinkmers command'
    @sidebar_name = 'joinkmers'
  end

  def buildindex
    @title = 'The umgap buildindex command'
    @sidebar_name = 'buildindex'
  end

  def printindex
    @title = 'The umgap printindex command'
    @sidebar_name = 'printindex'
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
