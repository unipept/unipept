# == Schema Information
#
# Table name: assemblies
#
#  id                         :integer          not null, primary key
#  genbank_assembly_accession :string(16)
#  refseq_assembly_accession  :string(16)
#  taxon_id                   :integer
#  genome_representation      :string(7)        not null
#  assembly_level             :string(20)       not null
#  assembly_name              :string(104)      not null
#  organism_name              :string(86)       not null
#  biosample                  :string(14)
#

require 'test_helper'

class AssemblyTest < ActiveSupport::TestCase

  test "should not save genbank_assembly_accession changes" do
    assembly = assemblies(:assembly1)
    oldValue = assembly.genbank_assembly_accession
    assembly.genbank_assembly_accession = oldValue + "aa"
    assembly.save
    assembly.reload
    assert_equal oldValue, assembly.genbank_assembly_accession, "Was able to save genbank_assembly_accession changes"
  end

  test "should not save refseq_assembly_accession changes" do
    assembly = assemblies(:assembly1)
    oldValue = assembly.refseq_assembly_accession
    assembly.refseq_assembly_accession = oldValue + "aa"
    assembly.save
    assembly.reload
    assert_equal oldValue, assembly.refseq_assembly_accession, "Was able to save refseq_assembly_accession changes"
  end

  test "should not save genome_representation changes" do
    assembly = assemblies(:assembly1)
    oldValue = assembly.genome_representation
    assembly.genome_representation = oldValue + "aa"
    assembly.save
    assembly.reload
    assert_equal oldValue, assembly.genome_representation, "Was able to save genome_representation changes"
  end

  test "should not save assembly_level changes" do
    assembly = assemblies(:assembly1)
    oldValue = assembly.assembly_level
    assembly.assembly_level = oldValue + "aa"
    assembly.save
    assembly.reload
    assert_equal oldValue, assembly.assembly_level, "Was able to save assembly_level changes"
  end

  test "should not save assembly_name changes" do
    assembly = assemblies(:assembly1)
    oldValue = assembly.assembly_name
    assembly.assembly_name = oldValue + "aa"
    assembly.save
    assembly.reload
    assert_equal oldValue, assembly.assembly_name, "Was able to save assembly_name changes"
  end

  test "should not save organism_name changes" do
    assembly = assemblies(:assembly1)
    oldValue = assembly.organism_name
    assembly.organism_name = oldValue + "aa"
    assembly.save
    assembly.reload
    assert_equal oldValue, assembly.organism_name, "Was able to save organism_name changes"
  end

  test "should not save biosample changes" do
    assembly = assemblies(:assembly1)
    oldValue = assembly.biosample
    assembly.biosample = oldValue + "aa"
    assembly.save
    assembly.reload
    assert_equal oldValue, assembly.biosample, "Was able to save biosample changes"
  end

  test "should raise error on delete" do
    assembly = assemblies(:assembly1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {assembly.delete}
  end

  test "should raise error on destroy" do
    assembly = assemblies(:assembly1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {assembly.destroy}
  end

  test "should fill in taxon_id field after precompute_taxa" do
    assembly = assemblies(:assembly2)
    assert_nil assembly.taxon_id
    Assembly.precompute_taxa
    assembly.reload
    assert_equal 1, assembly.taxon_id
  end

  test "should calculate assembly caches after precompute_genome_caches" do
    Assembly.precompute_assembly_caches
    Assembly.all.each do |assembly|
      assert_not_nil AssemblyCache.get_by_assembly_id(assembly.id)
    end
  end

end
