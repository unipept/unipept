class User < ActiveRecord::Base
  devise :cas_authenticatable

  attr_accessible :username

  def is_admin?
    return admin == 1
  end
end
