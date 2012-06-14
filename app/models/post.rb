# == Schema Information
#
# Table name: posts
#
#  id      :integer(4)      not null, primary key
#  title   :string(100)     not null
#  content :text            default(""), not null
#  date    :date            not null
#

class Post < ActiveRecord::Base
  attr_accessible :content, :date, :title
end
