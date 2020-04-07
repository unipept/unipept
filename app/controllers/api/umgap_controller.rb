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
      { name: 'Overview',           path: api_umgap_path },
      { name: 'Case studies',       path: api_umgap_casestudies_path }
    ]
  end

  def set_case_subnav
    @sidebar_subnav = [['Metagenomics', api_umgap_casestudy_metagenomics_path]]
  end

  def set_header
    @header_class = 'metagenomics'
  end
end
