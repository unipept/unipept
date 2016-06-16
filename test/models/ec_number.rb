require 'test_helper'

class EcNumberTest < ActiveSupport::TestCase
  test 'should rails error on create new EcNumber' do
    assert_raises(ActiveRecord::ReadOnlyRecord) { EcNumber.new.save }
  end

  test 'should raise error on save' do
    ec_number = ec_numbers(:ecnumber1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { ec_number.save }
  end

  test 'should raise error on code change' do
    ec_number = ec_numbers(:ecnumber2)
    assert_raises(ActiveRecord::ActiveRecordError) { ec_number.update_attribute(:code, '35') }
  end

  test 'should raise error on name change' do
    ec_number = ec_numbers(:ecnumber13)
    assert_raises(ActiveRecord::ActiveRecordError) { ec_number.update_attribute(:name, '35') }
  end

  test 'should raise error on delete' do
    ec_number = ec_numbers(:ecnumber1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { ec_number.delete }
  end

  test 'should raise error on destroy' do
    ec_number = ec_numbers(:ecnumber13)
    assert_raises(ActiveRecord::ReadOnlyRecord) { ec_number.destroy }
  end
end
