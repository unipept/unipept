# == Schema Information
#
# Table name: proteomes
#
#  id                        :integer          not null, primary key
#  proteome_accession_number :string(12)       not null
#  proteome_name             :string(86)       not null
#  taxon_id                  :integer
#  type_strain               :binary(1)        default("b'0'"), not null
#  reference_proteome        :binary(1)        default("b'0'"), not null
#  strain                    :string(45)
#  assembly                  :string(45)
#  name                      :string(128)
#

require 'test_helper'

class ProteomeTest < ActiveSupport::TestCase
  test 'should not save proteome_accession_number changes' do
    proteome = proteomes(:proteome1)
    old_value = proteome.proteome_accession_number
    proteome.proteome_accession_number = old_value + 'aa'
    proteome.save
    proteome.reload
    assert_equal old_value, proteome.proteome_accession_number, 'Was able to save genbank_proteome_accession changes'
  end

  test 'should not save proteome_name changes' do
    proteome = proteomes(:proteome1)
    old_value = proteome.proteome_name
    proteome.proteome_name = old_value + 'aa'
    proteome.save
    proteome.reload
    assert_equal old_value, proteome.proteome_name, 'Was able to save proteome_name changes'
  end

  test 'should not save type_strain changes' do
    proteome = proteomes(:proteome1)
    old_value = proteome.type_strain
    proteome.type_strain = !old_value
    proteome.save
    proteome.reload
    assert_equal old_value, proteome.type_strain, 'Was able to save type_strain changes'
  end

  test 'should not save reference_proteome changes' do
    proteome = proteomes(:proteome1)
    old_value = proteome.reference_proteome
    proteome.reference_proteome = !old_value
    proteome.save
    proteome.reload
    assert_equal old_value, proteome.reference_proteome, 'Was able to save reference_proteome changes'
  end

  test 'should not save strain changes' do
    proteome = proteomes(:proteome1)
    old_value = proteome.strain
    proteome.strain = old_value + 'aa'
    proteome.save
    proteome.reload
    assert_equal old_value, proteome.strain, 'Was able to save strain changes'
  end

  test 'should not save assembly changes' do
    proteome = proteomes(:proteome1)
    old_value = proteome.assembly
    proteome.assembly = old_value + 'aa'
    proteome.save
    proteome.reload
    assert_equal old_value, proteome.assembly, 'Was able to save assembly changes'
  end

  test 'should raise error on delete' do
    proteome = proteomes(:proteome1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { proteome.delete }
  end

  test 'should raise error on destroy' do
    proteome = proteomes(:proteome1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { proteome.destroy }
  end

  test 'should fill in taxon_id field after precompute_taxa' do
    proteome = proteomes(:proteome2)
    assert_nil proteome.taxon_id
    Proteome.precompute_taxa
    proteome.reload
    assert_equal 1, proteome.taxon_id
  end

  test 'should fill in name field after precompute_taxa' do
    proteome = proteomes(:proteome1)
    assert_nil proteome.name
    Proteome.precompute_taxa
    proteome.reload
    assert_equal 'proteome name strain', proteome.name
  end

  test 'shouldnt add strain name to proteome name when strain is nil' do
    proteome = proteomes(:proteome1)
    proteome.strain = nil
    assert_equal 'proteome name', proteome.full_name
  end

  test 'shouldnt add strain name to proteome name when its already there' do
    proteome = proteomes(:proteome1)
    assert_equal 'proteome name strain', proteome.full_name
    proteome.proteome_name = 'proteome name name'
    assert_equal 'proteome name name', proteome.full_name
    proteome.proteome_name = 'proteome 9'
    assert_equal 'proteome 9', proteome.full_name
    proteome.proteome_name = 'proteome (name)'
    assert_equal 'proteome (name)', proteome.full_name
  end

  test 'should calculate proteome caches after precompute_genome_caches' do
    Proteome.precompute_proteome_caches
    Proteome.all.each do |proteome|
      assert_not_nil ProteomeCache.get_by_proteome_id(proteome.id)
    end
  end
end
