# == Schema Information
#
# Table name: sequences
#
#  id       :integer(4)      not null, primary key
#  sequence :string(50)      not null
#

class Sequence < ActiveRecord::Base
  attr_accessible nil
  
  has_many :peptides
  
  validates :sequence,  :presence   => true,
                        :length     => { :within => 5..50 },
                        :format     => { :with => /\A[A-Z]*\z/ },
                        :uniqueness => true
end
