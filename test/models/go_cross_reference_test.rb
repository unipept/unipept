# == Schema Information
#
# Table name: go_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  go_term_code     :string(15)       not null
#

require 'test_helper'

class GoCrossReferenceTest < ActiveSupport::TestCase
  test 'should fail to create new GoCrossReference' do
    assert_not GoCrossReference.new.save
  end

  test 'should fail to save' do
    gocrossreference = go_cross_references(:gocrossreference1)
    assert_not gocrossreference.save
  end

  test 'should raise error on uniprot_entry_id change' do
    gocrossreference = go_cross_references(:gocrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { gocrossreference.update_attribute(:uniprot_entry_id, 35) }
  end

  test 'should raise error on go_term_code change' do
    gocrossreference = go_cross_references(:gocrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { gocrossreference.update_attribute(:go_term_code, '35') }
  end

  test 'should raise error on delete' do
    gocrossreference = go_cross_references(:gocrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { gocrossreference.delete }
  end

  test 'should raise error on destroy' do
    gocrossreference = go_cross_references(:gocrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { gocrossreference.destroy }
  end
end
