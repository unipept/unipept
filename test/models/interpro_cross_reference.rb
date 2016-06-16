require 'test_helper'

class InterproCrossReferenceTest < ActiveSupport::TestCase
  test 'should rails error on create new interprocrossreference' do
    assert_raises(ActiveRecord::ReadOnlyRecord) { interprocrossreference.new.save }
  end

  test 'should raise error on save' do
    interprocrossreference = interpro_cross_references(:interprocrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { interprocrossreference.save }
  end

  test 'should raise error on uniprot_entry_id change' do
    interprocrossreference = interpro_cross_references(:interprocrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { interprocrossreference.update_attribute(:uniprot_entry_id, 35) }
  end

  test 'should raise error on go_id change' do
    interprocrossreference = interpro_cross_references(:interprocrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { interprocrossreference.update_attribute(:interpro_entry_code, '35') }
  end

  test 'should raise error on delete' do
    interprocrossreference = interpro_cross_references(:interprocrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { interprocrossreference.delete }
  end

  test 'should raise error on destroy' do
    interprocrossreference = interpro_cross_references(:interprocrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { interprocrossreference.destroy }
  end
end
