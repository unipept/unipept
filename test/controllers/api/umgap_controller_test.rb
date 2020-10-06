require 'test_helper'

class Api::UmgapControllerTest < ActionController::TestCase
  test 'should get index' do
    get :index
    assert_response :success
    assert_template :index
    assert_equal 'Unipept MetaGenomics Analysis Pipeline', assigns(:title)
    assert_equal 'Overview', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get casestudies' do
    get :casestudies
    assert_response :success
    assert_template :casestudies
    assert_equal 'UMGAP case studies', assigns(:title)
    assert_equal 'Case studies', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get casestudy_metagenomics' do
    get :casestudy_metagenomics
    assert_response :success
    assert_template :casestudy_metagenomics
    assert_equal 'Case study: metagenomics', assigns(:title)
    assert_equal 'Case studies', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get fastq2fasta' do
    get :fastq2fasta
    assert_response :success
    assert_template :fastq2fasta
    assert_equal 'The umgap fastq2fasta command', assigns(:title)
    assert_equal 'fastq2fasta', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get translate' do
    get :translate
    assert_response :success
    assert_template :translate
    assert_equal 'The umgap translate command', assigns(:title)
    assert_equal 'translate', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get prot2tryp' do
    get :prot2tryp
    assert_response :success
    assert_template :prot2tryp
    assert_equal 'The umgap prot2tryp command', assigns(:title)
    assert_equal 'prot2tryp', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get prot2kmer' do
    get :prot2kmer
    assert_response :success
    assert_template :prot2kmer
    assert_equal 'The umgap prot2kmer command', assigns(:title)
    assert_equal 'prot2kmer', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get filter' do
    get :filter
    assert_response :success
    assert_template :filter
    assert_equal 'The umgap filter command', assigns(:title)
    assert_equal 'filter', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get pept2lca' do
    get :pept2lca
    assert_response :success
    assert_template :pept2lca
    assert_equal 'The umgap pept2lca command', assigns(:title)
    assert_equal 'pept2lca', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get prot2tryp2lca' do
    get :prot2tryp2lca
    assert_response :success
    assert_template :prot2tryp2lca
    assert_equal 'The umgap prot2tryp2lca command', assigns(:title)
    assert_equal 'prot2tryp2lca', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get prot2kmer2lca' do
    get :prot2kmer2lca
    assert_response :success
    assert_template :prot2kmer2lca
    assert_equal 'The umgap prot2kmer2lca command', assigns(:title)
    assert_equal 'prot2kmer2lca', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get bestof' do
    get :bestof
    assert_response :success
    assert_template :bestof
    assert_equal 'The umgap bestof command', assigns(:title)
    assert_equal 'bestof', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get seedextend' do
    get :seedextend
    assert_response :success
    assert_template :seedextend
    assert_equal 'The umgap seedextend command', assigns(:title)
    assert_equal 'seedextend', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get uniq' do
    get :uniq
    assert_response :success
    assert_template :uniq
    assert_equal 'The umgap uniq command', assigns(:title)
    assert_equal 'uniq', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get taxa2agg' do
    get :taxa2agg
    assert_response :success
    assert_template :taxa2agg
    assert_equal 'The umgap taxa2agg command', assigns(:title)
    assert_equal 'taxa2agg', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get snaptaxon' do
    get :snaptaxon
    assert_response :success
    assert_template :snaptaxon
    assert_equal 'The umgap snaptaxon command', assigns(:title)
    assert_equal 'snaptaxon', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get taxa2freq' do
    get :taxa2freq
    assert_response :success
    assert_template :taxa2freq
    assert_equal 'The umgap taxa2freq command', assigns(:title)
    assert_equal 'taxa2freq', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get taxa2tree' do
    get :taxa2tree
    assert_response :success
    assert_template :taxa2tree
    assert_equal 'The umgap taxa2tree command', assigns(:title)
    assert_equal 'taxa2tree', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get taxonomy' do
    get :taxonomy
    assert_response :success
    assert_template :taxonomy
    assert_equal 'The umgap taxonomy command', assigns(:title)
    assert_equal 'taxonomy', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get splitkmers' do
    get :splitkmers
    assert_response :success
    assert_template :splitkmers
    assert_equal 'The umgap splitkmers command', assigns(:title)
    assert_equal 'splitkmers', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get joinkmers' do
    get :joinkmers
    assert_response :success
    assert_template :joinkmers
    assert_equal 'The umgap joinkmers command', assigns(:title)
    assert_equal 'joinkmers', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get buildindex' do
    get :buildindex
    assert_response :success
    assert_template :buildindex
    assert_equal 'The umgap buildindex command', assigns(:title)
    assert_equal 'buildindex', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

  test 'should get printindex' do
    get :printindex
    assert_response :success
    assert_template :printindex
    assert_equal 'The umgap printindex command', assigns(:title)
    assert_equal 'printindex', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
  end

end
