# == Schema Information
#
# Table name: lineages
#
#  taxon_id         :integer          unsigned, not null, primary key
#  superkingdom     :integer
#  kingdom          :integer
#  subkingdom       :integer
#  superphylum      :integer
#  phylum           :integer
#  subphylum        :integer
#  superclass       :integer
#  class            :integer
#  subclass         :integer
#  infraclass       :integer
#  superorder       :integer
#  order            :integer
#  suborder         :integer
#  infraorder       :integer
#  parvorder        :integer
#  superfamily      :integer
#  family           :integer
#  subfamily        :integer
#  tribe            :integer
#  subtribe         :integer
#  genus            :integer
#  subgenus         :integer
#  species_group    :integer
#  species_subgroup :integer
#  species          :integer
#  subspecies       :integer
#  varietas         :integer
#  forma            :integer
#

require 'test_helper'

class LineageTest < ActiveSupport::TestCase
  test 'should fail to create new lineage' do
    assert_not Lineage.new.save
  end

  test 'should fail to save' do
    lineage = lineages(:lineage1)
    assert_not lineage.save
  end

  test 'should raise error on taxon_id change' do
    lineage = lineages(:lineage1)
    assert_raises(ActiveRecord::ActiveRecordError) { lineage.update_attribute(:taxon_id, 35) }
  end

  test 'should raise error on delete' do
    lineage = lineages(:lineage1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { lineage.delete }
  end

  test 'should raise error on destroy' do
    lineage = lineages(:lineage1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { lineage.destroy }
  end

  test 'should iterate correctly' do
    lineage = lineages(:lineage1)
    assert lineage.has_next?
    assert_equal 0, lineage.get_iterator_position
    lineage.set_iterator_position(2)
    assert_equal 2, lineage.get_iterator_position
    lineage.next
    assert_equal 3, lineage.get_iterator_position
    lineage.next_t
    assert_equal 4, lineage.get_iterator_position
    lineage.set_iterator_position(27)
    assert lineage.has_next?
    lineage.set_iterator_position(28)
    assert_not lineage.has_next?
  end

  test 'should give correct iterator result' do
    lineage = lineages(:lineage1)
    taxon = taxons(:taxon2)
    assert_nil lineage.next
    assert_equal taxon.id, lineage.next
    lineage.set_iterator_position(1)
    assert_equal taxon, lineage.next_t
  end

  test 'should give correct result for to_a' do
    lineage = lineages(:lineage1)
    array = ['', 'kingdom1', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'species1', '', '', '']
    assert_equal array, lineage.to_a
  end

  test 'calculate_lca should return -1 for empty lists' do
    assert_equal(-1, Lineage.calculate_lca([]))
  end

  test 'calculate_lca should return root (1) for different superkingdoms' do
    root1 = lineages(:root1)
    root2 = lineages(:root2)
    assert_equal 1, Lineage.calculate_lca([root1, root2])
  end

  test 'calculate_lca should return root (1) for different kingdoms without superkingdom' do
    root3 = lineages(:root3)
    root4 = lineages(:root4)
    assert_equal 1, Lineage.calculate_lca([root3, root4])
  end

  test 'calculate_lca should return last common field' do
    lineage1 = lineages(:lineage2)
    lineage2 = lineages(:kingdom1)
    assert_equal 2, Lineage.calculate_lca([lineage1, lineage2])
  end

  test 'calculate_lca should count nil as separate field' do
    lineage1 = lineages(:kingdom1)
    lineage2 = lineages(:kingdom2)
    assert_equal 2, Lineage.calculate_lca([lineage1, lineage2])
  end

  test "calculate_lca shouldn't count nil as separate field at species level" do
    lineage1 = lineages(:kingdom1)
    lineage2 = lineages(:species1)
    assert_equal 4, Lineage.calculate_lca([lineage1, lineage2])
  end

  test "calculate_lca shouldn't count nil as separate field at genus level" do
    lineage1 = lineages(:kingdom1)
    lineage2 = lineages(:genus1)
    assert_equal 5, Lineage.calculate_lca([lineage1, lineage2])
  end

  test 'calculate_lca should ignore invalid taxa' do
    lineage1 = lineages(:kingdom2)
    lineage2 = lineages(:kingdom3)
    assert_equal 3, Lineage.calculate_lca([lineage1, lineage2])
  end

  test 'cast should not raise a range error for negative values' do
    lineage = lineages(:kingdom2)
    def lineage.convert
      uint = ActiveRecord::Type::UnsignedInteger.new
      uint.ensure_in_range('-5')
    end
    lineage.convert
  end
end
