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
  test 'should not save username changes' do
    user = users(:bart)
    user.username = 'change!'
    user.save
    user.reload
    assert_equal 'bart', user.username, 'Was able to save username changes'
  end

  test 'should not save admin changes' do
    user = users(:bart)
    user.admin = 1
    user.save
    user.reload
    assert_equal 0, user.admin, 'Was able to save admin changes'
  end

  test 'should not be admin' do
    user = users(:bart)
    assert_not user.is_admin?, 'Normal user was admin'
  end

  test 'should be admin' do
    user = users(:bart_admin)
    assert user.is_admin?, "admin user wasn't admin"
  end
end
