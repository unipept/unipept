# == Schema Information
#
# Table name: ec_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  ec_number_code   :string(15)       not null
#

require 'test_helper'

class EcCrossReferenceTest < ActiveSupport::TestCase
  test 'should fail to create new EcCrossReference' do
    assert_not EcCrossReference.new.save
  end

  test 'should raise error on save' do
    eccrossreference = ec_cross_references(:eccrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { eccrossreference.save }
  end

  test 'should raise error on uniprot_entry_id change' do
    eccrossreference = ec_cross_references(:eccrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { eccrossreference.update_attribute(:uniprot_entry_id, 35) }
  end

  test 'should raise error on ec_number_code change' do
    eccrossreference = ec_cross_references(:eccrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { eccrossreference.update_attribute(:ec_number_code, '35') }
  end

  test 'should raise error on delete' do
    eccrossreference = ec_cross_references(:eccrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { eccrossreference.delete }
  end

  test 'should raise error on destroy' do
    eccrossreference = ec_cross_references(:eccrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { eccrossreference.destroy }
  end
end
