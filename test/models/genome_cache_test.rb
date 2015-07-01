# == Schema Information
#
# Table name: genome_caches
#
#  bioproject_id  :integer          not null, primary key
#  json_sequences :text(16777215)   not null
#

require 'test_helper'

class GenomeCacheTest < ActiveSupport::TestCase
  test 'should not save genomecache without json_sequences' do
    genomecache = GenomeCache.new
    assert_not genomecache.save, 'Saved the genomecache without json_sequences'
  end

  test 'should save genomecache with valid fields' do
    genomecache = GenomeCache.new
    genomecache.bioproject_id = 99
    genomecache.json_sequences = 'test'
    assert genomecache.save, 'Unable to save the post with valid fields'
  end

  test 'should return the genome when cache is present' do
    genomecache = GenomeCache.find_by_bioproject_id(1)
    assert_not_nil genomecache
    genomecache = GenomeCache.get_by_bioproject_id(1)
    assert_not_nil genomecache
    genomecache = GenomeCache.find_by_bioproject_id(1)
    assert_not_nil genomecache
  end

  test 'should calculate, return and store the genome when cache is not present' do
    genomecache = GenomeCache.find_by_bioproject_id(2)
    assert_nil genomecache
    genomecache = GenomeCache.get_by_bioproject_id(2)
    assert_not_nil genomecache
    genomecache = GenomeCache.find_by_bioproject_id(2)
    assert_not_nil genomecache
  end
end
