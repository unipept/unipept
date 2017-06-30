# == Schema Information
#
# Table name: proteome_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  proteome_id      :integer          not null
#

require 'test_helper'

class ProteomeCrossReferenceTest < ActiveSupport::TestCase
  test 'should fail to create new proteome cross reference' do
    assert_not ProteomeCrossReference.new.save
  end

  test 'should raise error on save' do
    as = proteome_cross_references(:proteomecrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { as.save }
  end

  test 'should raise error on uniprot_entry_id change' do
    as = proteome_cross_references(:proteomecrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { as.update_attribute(:uniprot_entry_id, 35) }
  end

  test 'should raise error on proteome_id change' do
    as = proteome_cross_references(:proteomecrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { as.update_attribute(:proteome_id, 35) }
  end

  test 'should raise error on delete' do
    as = proteome_cross_references(:proteomecrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { as.delete }
  end

  test 'should raise error on destroy' do
    as = proteome_cross_references(:proteomecrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { as.destroy }
  end
end
