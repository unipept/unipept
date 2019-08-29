# == Schema Information
#
# Table name: go_terms
#
#  id        :integer          unsigned, not null, primary key
#  code      :string(15)       not null
#  namespace :string(18)       not null
#  name      :string(200)      not null
#

require 'test_helper'

class GoTermTest < ActiveSupport::TestCase
  test 'should rails error on create new GoTerm' do
    assert_raises(ActiveRecord::ReadOnlyRecord) { GoTerm.new.save }
  end

  test 'should raise error on save' do
    go_term = go_terms(:goterm1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { go_term.save }
  end

  test 'should raise error on code change' do
    go_term = go_terms(:goterm1)
    assert_raises(ActiveRecord::ActiveRecordError) { go_term.update_attribute(:code, '35') }
  end

  test 'should raise error on namespace change' do
    go_term = go_terms(:goterm1)
    assert_raises(ActiveRecord::ActiveRecordError) { go_term.update_attribute(:namespace, '35') }
  end

  test 'should raise error on name change' do
    go_term = go_terms(:goterm1)
    assert_raises(ActiveRecord::ActiveRecordError) { go_term.update_attribute(:name, '35') }
  end

  test 'should raise error on delete' do
    go_term = go_terms(:goterm1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { go_term.delete }
  end

  test 'should raise error on destroy' do
    go_term = go_terms(:goterm1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { go_term.destroy }
  end
end
