# == Schema Information
#
# Table name: proteome_caches
#
#  proteome_id    :integer          not null, primary key
#  json_sequences :text(16777215)   not null
#

require 'test_helper'

class ProteomeCacheTest < ActiveSupport::TestCase
  test 'should not save proteomecache without json_sequences' do
    proteomecache = ProteomeCache.new
    assert_not proteomecache.save, 'Saved the proteomecache without json_sequences'
  end

  test 'should save proteomecache with valid fields' do
    proteomecache = ProteomeCache.new
    proteomecache.proteome_id = 99
    proteomecache.json_sequences = 'test'
    assert proteomecache.save, 'Unable to save the post with valid fields'
  end

  test 'should return the assembly when cache is present' do
    proteomecache = ProteomeCache.find_by_proteome_id(1)
    assert_not_nil proteomecache
    proteomecache = ProteomeCache.get_by_proteome_id(1)
    assert_not_nil proteomecache
    proteomecache = ProteomeCache.find_by_proteome_id(1)
    assert_not_nil proteomecache
  end

  test 'should calculate, return and store the assembly when cache is not present' do
    proteomecache = ProteomeCache.find_by_proteome_id(2)
    assert_nil proteomecache
    proteomecache = ProteomeCache.get_by_proteome_id(2)
    assert_not_nil proteomecache
    proteomecache = ProteomeCache.find_by_proteome_id(2)
    assert_not_nil proteomecache
  end
end
