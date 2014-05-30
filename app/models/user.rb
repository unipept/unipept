# == Schema Information
#
# Table name: users
#
#  id       :integer          not null, primary key
#  username :string(8)        not null
#  admin    :integer          default(0), not null
#

class User < ActiveRecord::Base
  devise :cas_authenticatable

  attr_accessible :username

  def is_admin?
    return admin == 1
  end
end
