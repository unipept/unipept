# == Schema Information
#
# Table name: proteome_caches
#
#  proteome_id    :integer          unsigned, not null, primary key
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

  test 'should return the proteome when cache is present' do
    proteomecache = ProteomeCache.find_by(proteome_id: 1)
    assert_not_nil proteomecache
    proteomecache = ProteomeCache.get_encoded_sequences(1)
    assert_not_nil proteomecache
    proteomecache = ProteomeCache.find_by(proteome_id: 1)
    assert_not_nil proteomecache
  end

  test 'should calculate, return and store the assembly when cache is not present' do
    proteomecache = ProteomeCache.find_by(proteome_id: 2)
    assert_nil proteomecache
    proteomecache = ProteomeCache.get_encoded_sequences(2)
    assert_not_nil proteomecache
    proteomecache = ProteomeCache.find_by(proteome_id: 2)
    assert_not_nil proteomecache
  end

  test 'should delta encode' do
    result = ProteomeCache.delta_encode(nil)
    assert_equal [], result
    result = ProteomeCache.delta_encode([])
    assert_equal [], result
    result = ProteomeCache.delta_encode([1])
    assert_equal [1], result
    result = ProteomeCache.delta_encode([1, 2, 3])
    assert_equal [1, 1, 1], result
    result = ProteomeCache.delta_encode([3, 3, 9])
    assert_equal [3, 0, 6], result
  end

  test 'should delta decode' do
    result = ProteomeCache.delta_decode(nil)
    assert_equal [], result
    result = ProteomeCache.delta_decode([])
    assert_equal [], result
    result = ProteomeCache.delta_decode([1])
    assert_equal [1], result
    result = ProteomeCache.delta_decode([1, 1, 1])
    assert_equal [1, 2, 3], result
    result = ProteomeCache.delta_decode([3, 0, 6])
    assert_equal [3, 3, 9], result
  end
end
