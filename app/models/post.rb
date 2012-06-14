class Post < ActiveRecord::Base
  attr_accessible :content, :date, :title
end
