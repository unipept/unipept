# == Schema Information
#
# Table name: assembly_caches
#
#  assembly_id    :integer          not null, primary key
#  json_sequences :text(16777215)   not null
#

require 'test_helper'

class AssemblyCacheTest < ActiveSupport::TestCase

  test "should not save assemblycache without json_sequences" do
    assemblycache = AssemblyCache.new
    assert_not assemblycache.save, "Saved the assemblycache without json_sequences"
  end

  test "should save assemblycache with valid fields" do
    assemblycache = AssemblyCache.new
    assemblycache.assembly_id = 99
    assemblycache.json_sequences = "test"
    assert assemblycache.save, "Unable to save the post with valid fields"
  end

  test "should return the assembly when cache is present" do
    assemblycache = AssemblyCache.find_by_assembly_id(1)
    assert_not_nil assemblycache
    assemblycache = AssemblyCache.get_by_assembly_id(1)
    assert_not_nil assemblycache
    assemblycache = AssemblyCache.find_by_assembly_id(1)
    assert_not_nil assemblycache
  end

  test "should calculate, return and store the assembly when cache is not present" do
    assemblycache = AssemblyCache.find_by_assembly_id(2)
    assert_nil assemblycache
    assemblycache = AssemblyCache.get_by_assembly_id(2)
    assert_not_nil assemblycache
    assemblycache = AssemblyCache.find_by_assembly_id(2)
    assert_not_nil assemblycache
  end
end
