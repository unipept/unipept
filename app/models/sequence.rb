# == Schema Information
#
# Table name: sequences
#
#  id       :integer(4)      not null, primary key
#  sequence :string(50)      not null
#

class Sequence < ActiveRecord::Base
  attr_accessible :sequence
  
  validates :sequence,  :presence   => true,
                        :length     => { :minimum => 5 , :maximum => 50},
                        :format     => { :with => /\A[A-Z]*\z/ },
                        :uniqueness => true
end
