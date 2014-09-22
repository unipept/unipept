class OrganismsControllerTest < ActionController::TestCase

  test "should get index" do
    get :index
    assert_response :success
    assert_template :index
    assert_not_nil assigns(:organisms)
    assert_equal "All organisms", assigns(:title)
  end

  test "should show organisms" do
    taxon1 = taxons(:taxon1)
    get :show, {'id' => "1"}
    assert_response :success
    assert_template :show
    assert_equal taxon1, assigns(:organism)
    assert_equal taxon1.name, assigns(:title)
    assert_not_nil assigns(:uniprot_entries)
    assigns(:uniprot_entries).each{|entry| assert_equal taxon1.id, entry.taxon_id}
  end

  test "should redirect to index when show organism doesn't exist" do
    get :show, {'id' => "-11"}
    assert flash[:error].start_with? "No matches for"
    assert_redirected_to organisms_path
  end

end
