require 'test_helper'

class GoLcaTest < ActiveSupport::TestCase
  test 'should rails error on create new GoLca' do
    assert_raises(ActiveRecord::ReadOnlyRecord) { GoLca.new.save }
  end

  test 'should raise error on save' do
    go_lca = go_lcas(:golca1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { go_lca.save }
  end

  test 'should raise error on sequence_id change' do
    go_lca = go_lcas(:golca3)
    assert_raises(ActiveRecord::ActiveRecordError) { go_lca.update_attribute(:sequence_id, 35) }
  end

  test 'should raise error on go_lca change' do
    go_lca = go_lcas(:golca2)
    assert_raises(ActiveRecord::ActiveRecordError) { go_lca.update_attribute(:go_lca, 35) }
  end

  test 'should raise error on go_lca_il change' do
    go_lca = go_lcas(:golca3)
    assert_raises(ActiveRecord::ActiveRecordError) { go_lca.update_attribute(:go_lca_il, 35) }
  end

  test 'should raise error on delete' do
    go_lca = go_lcas(:golca1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { go_lca.delete }
  end

  test 'should raise error on destroy' do
    go_lca = go_lcas(:golca1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { go_lca.destroy }
  end
end
