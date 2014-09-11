# == Schema Information
#
# Table name: users
#
#  id       :integer          not null, primary key
#  username :string(8)        not null
#  admin    :integer          default(0), not null
#

require 'test_helper'

class UserTest < ActiveSupport::TestCase

  test "should raise error on create" do
    assert_raises(ActiveRecord::ReadOnlyRecord) {User.create()}
  end

  test "should raise error on save" do
    user = users(:bart)
    assert_raises(ActiveRecord::ReadOnlyRecord) {user.save}
  end

  test "should raise error on username change" do
    user = users(:bart)
    assert_raises(ActiveRecord::ActiveRecordError) {user.update_attribute(:username, 'other name')}
  end

  test "should raise error on admin change" do
    user = users(:bart)
    assert_raises(ActiveRecord::ActiveRecordError) {user.update_attribute(:admin, 1)}
  end

  test "should raise error on delete" do
    user = users(:bart)
    assert_raises(ActiveRecord::ReadOnlyRecord) {user.delete}
  end

  test "should raise error on destroy" do
    user = users(:bart)
    assert_raises(ActiveRecord::ReadOnlyRecord) {user.destroy}
  end

  test "should not be admin" do
    user = users(:bart)
    assert_not user.is_admin?, "Normal user was admin"
  end

  test "should be admin" do
    user = users(:bart_admin)
    assert user.is_admin?, "admin user wasn't admin"
  end

end
