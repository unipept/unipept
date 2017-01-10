# == Schema Information
#
# Table name: users
#
#  id       :integer          not null, primary key
#  username :string(8)        not null
#  admin    :integer          default(0), not null
#

class User < ApplicationRecord
  devise :cas_authenticatable

  attr_readonly :id, :username, :admin

  def admin?
    admin == 1
  end
end
