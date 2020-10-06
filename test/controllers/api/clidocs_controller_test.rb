require 'test_helper'

class Api::ClidocsControllerTest < ActionController::TestCase
  test 'should get index' do
    get :index
    assert_response :success
    assert_template :index
    assert_equal 'Unipept command line interface', assigns(:title)
    assert_equal 'Overview', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get casestudies' do
    get :casestudies
    assert_response :success
    assert_template :casestudies
    assert_equal 'Unipept command line interface case studies', assigns(:title)
    assert_equal 'Case studies', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get casestudy_tpa' do
    get :casestudy_tpa
    assert_response :success
    assert_template :casestudy_tpa
    assert_equal 'Case study: tryptic peptide', assigns(:title)
    assert_equal 'Case studies', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get casestudy_mpa' do
    get :casestudy_mpa
    assert_response :success
    assert_template :casestudy_mpa
    assert_equal 'Case study: metaproteomics data', assigns(:title)
    assert_equal 'Case studies', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should redirect to casestudy_metagenomics' do
    get :casestudy_metagenomics
    assert_response :redirect
  end

  test 'should get pept2prot' do
    get :pept2prot
    assert_response :success
    assert_template :pept2prot
    assert_equal 'The unipept pept2prot command', assigns(:title)
    assert_equal 'unipept pept2prot', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get pept2taxa' do
    get :pept2taxa
    assert_response :success
    assert_template :pept2taxa
    assert_equal 'The unipept pept2taxa command', assigns(:title)
    assert_equal 'unipept pept2taxa', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get pept2lca' do
    get :pept2lca
    assert_response :success
    assert_template :pept2lca
    assert_equal 'The unipept pept2lca command', assigns(:title)
    assert_equal 'unipept pept2lca', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get taxa2lca' do
    get :taxa2lca
    assert_response :success
    assert_template :taxa2lca
    assert_equal 'The unipept taxa2lca command', assigns(:title)
    assert_equal 'unipept taxa2lca', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get taxonomy' do
    get :taxonomy
    assert_response :success
    assert_template :taxonomy
    assert_equal 'The unipept taxonomy command', assigns(:title)
    assert_equal 'unipept taxonomy', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get uniprot' do
    get :uniprot
    assert_response :success
    assert_template :uniprot
    assert_equal 'The uniprot command', assigns(:title)
    assert_equal 'uniprot', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get peptfilter' do
    get :peptfilter
    assert_response :success
    assert_template :peptfilter
    assert_equal 'The peptfilter command', assigns(:title)
    assert_equal 'peptfilter', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get prot2pept' do
    get :prot2pept
    assert_response :success
    assert_template :prot2pept
    assert_equal 'The prot2pept command', assigns(:title)
    assert_equal 'prot2pept', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end
end
