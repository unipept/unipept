# == Schema Information
#
# Table name: genomes
#
#  id            :integer          not null, primary key
#  name          :string(120)      not null
#  bioproject_id :integer          not null
#  insdc_id      :string(15)       not null
#  status        :string(20)       not null
#  taxon_id      :integer
#

require 'test_helper'

class GenomeTest < ActiveSupport::TestCase
  test 'should not save name changes' do
    genome = genomes(:genome1)
    old_value = genome.name
    genome.name = old_value + 'aa'
    genome.save
    genome.reload
    assert_equal old_value, genome.name, 'Was able to save name changes'
  end

  test 'should not save bioproject_id changes' do
    genome = genomes(:genome1)
    old_value = genome.bioproject_id
    genome.bioproject_id = old_value + 1
    genome.save
    genome.reload
    assert_equal old_value, genome.bioproject_id, 'Was able to save bioproject_id changes'
  end

  test 'should not save insdc_id changes' do
    genome = genomes(:genome1)
    old_value = genome.insdc_id
    genome.insdc_id = old_value + 'aa'
    genome.save
    genome.reload
    assert_equal old_value, genome.insdc_id, 'Was able to save insdc_id changes'
  end

  test 'should not save status changes' do
    genome = genomes(:genome1)
    old_value = genome.status
    genome.status = old_value + 'aa'
    genome.save
    genome.reload
    assert_equal old_value, genome.status, 'Was able to save status changes'
  end

  test 'should raise error on delete' do
    genome = genomes(:genome1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { genome.delete }
  end

  test 'should raise error on destroy' do
    genome = genomes(:genome1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { genome.destroy }
  end

  test 'should give a correct result for get_genome_species' do
    species = Genome.get_genome_species.to_hash
    assert_equal 1, species.size
    assert_equal 1, species[0]['id']
  end

  test 'should return empty resultset for invalid input for get_by_species_id' do
    genome = Genome.get_by_species_id('invalid')
    assert genome.empty?
  end

  test 'should give a correct result for get_by_species_id' do
    genome = Genome.get_by_species_id(1)
    assert_not genome.empty?
    genome = genome.to_a
    assert_equal 1, genome.size
    assert_equal 'genome1', genome.first.name
  end

  test 'should fill in taxon_id field after precompute_taxa' do
    genome = genomes(:genome2)
    assert_nil genome.taxon_id
    Genome.precompute_taxa
    genome.reload
    assert_equal 1, genome.taxon_id
  end

  test 'should calculate genome caches after precompute_genome_caches' do
    Genome.precompute_genome_caches
    Genome.all.each do |genome|
      assert_not_nil GenomeCache.find_by_bioproject_id(genome.bioproject_id)
    end
  end
end
