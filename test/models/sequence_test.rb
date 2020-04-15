# == Schema Information
#
# Table name: sequences
#
#  id       :integer          unsigned, not null, primary key
#  sequence :string(50)       not null
#  lca      :integer          unsigned
#  lca_il   :integer          unsigned
#  fa       :binary(16777215)
#  fa_il    :binary(16777215)
#

require 'test_helper'

class SequenceTest < ActiveSupport::TestCase
  test 'should fail to create new sequence' do
    assert_not Sequence.new.save
  end

  test 'should raise error on save' do
    sequence = sequences(:sequence1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { sequence.save }
  end

  test 'should raise error on new save' do
    sequence = Sequence.new(id: 20, sequence: 'NO', lca: 1, lca_il: 1, fa: '{}', fa_il: '{}')
    assert_raises(ActiveRecord::ReadOnlyRecord) { sequence.save }
  end

  test 'should raise error on sequence change' do
    sequence = sequences(:sequence1)
    assert_raises(ActiveRecord::ActiveRecordError) { sequence.update_attribute(:sequence, 'AAAAAAA') }
  end

  test 'should raise error on lca change' do
    sequence = sequences(:sequence1)
    assert_raises(ActiveRecord::ActiveRecordError) { sequence.update_attribute(:lca, 35) }
  end

  test 'should raise error on lca_il change' do
    sequence = sequences(:sequence1)
    assert_raises(ActiveRecord::ActiveRecordError) { sequence.update_attribute(:lca_il, 35) }
  end

  test 'should raise error on delete' do
    sequence = sequences(:sequence1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { sequence.delete }
  end

  test 'should raise error on destroy' do
    sequence = sequences(:sequence1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { sequence.destroy }
  end

  test 'should give correct result for peptides' do
    peptide1 = peptides(:pept1)
    peptide2 = peptides(:pept2)
    sequence = sequences(:sequence1)
    assert_equal [peptide1, peptide2], sequence.peptides.to_a
    assert_equal [peptide1, peptide2], sequence.peptides(true).to_a
    assert_equal [peptide2], sequence.peptides(false).to_a
  end

  test 'should give correct result for lineages' do
    sequence1 = sequences(:sequence1)
    lineage1 = lineages(:lineage1)
    lineage2 = lineages(:lineage2)
    assert_raises(ArgumentError) { sequence1.lineages('a') }
    assert_raises(ArgumentError) { sequence1.lineages(true, 'a') }
    assert_equal [lineage1, lineage2], sequence1.lineages.to_a
    assert_equal [lineage1, lineage2], sequence1.lineages(true).to_a
    assert_equal [lineage1, lineage2], sequence1.lineages(true, true).to_a
    assert_equal [lineage1, lineage2], sequence1.lineages(true, false).to_a
    assert_equal [lineage2], sequence1.lineages(false).to_a
    assert_equal [lineage2], sequence1.lineages(false, true).to_a
    assert_equal [lineage2], sequence1.lineages(false, false).to_a
  end

  test 'should eager load for lineages' do
    sequence1 = sequences(:sequence1)
    lineage = sequence1.lineages(true).first
    assert_not lineage.association(:name).loaded?
    lineage = sequence1.lineages(true, false).first
    assert_not lineage.association(:name).loaded?
    lineage = sequence1.lineages(true, true).first
    assert lineage.association(:name).loaded?
    assert lineage.association(:species_t).loaded?
    lineage = sequence1.lineages(false).first
    assert_not lineage.association(:name).loaded?
    lineage = sequence1.lineages(false, false).first
    assert_not lineage.association(:name).loaded?
    lineage = sequence1.lineages(false, true).first
    assert lineage.association(:name).loaded?
    assert lineage.association(:species_t).loaded?
  end

  test 'should give correct result for calculate_lca' do
    sequence1 = sequences(:sequence1)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    assert_equal taxon1.id, sequence1.calculate_lca
    assert_equal taxon1.id, sequence1.calculate_lca(true)
    assert_equal taxon1, sequence1.calculate_lca(true, true)
    assert_equal taxon1.id, sequence1.calculate_lca(true, false)
    assert_equal taxon2.id, sequence1.calculate_lca(false)
    assert_equal taxon2, sequence1.calculate_lca(false, true)
    assert_equal taxon2.id, sequence1.calculate_lca(false, false)
  end

  test 'should give correct result for calculate_fa' do
    expected_nil_fallback = { 'num' => { 'all' => 0, 'EC' => 0, 'GO' => 0 }, 'data' => {} }
    data1 = { seq: sequences(:sequence1),
              exp_fa: { 'num' => { 'all' => 1, 'EC' => 1, 'GO' => 1 }, 'data' => { 'GO:0016569' => 1, 'GO:0006281' => 1, 'GO:0000781' => 1, 'EC:2.7.11.1' => 1 } },
              exp_il: { 'num' => { 'all' => 22, 'EC' => 4, 'GO' => 2 }, 'data' => { 'EC:2.7.11.1' => 4, 'GO:0004674' => 1, 'GO:0005634' => 1, 'GO:0005524' => 1, 'GO:0016301' => 1 } } }
    data2 = { seq: sequences(:sequence2),
              exp_fa: { 'num' => { 'all' => 3, 'EC' => 0, 'GO' => 3 }, 'data' => { 'GO:0051301' => 3, 'GO:0005525' => 3, 'GO:0046872' => 3, 'GO:0007049' => 3 } },
              exp_il: { 'num' => { 'all' => 4, 'EC' => 1, 'GO' => 4 }, 'data' => { 'GO:0005759' => 1, 'GO:0004760' => 1, 'GO:0051301' => 3, 'GO:0005739' => 1 } } }
    data3 = { seq: sequences(:sequence3),
              exp_fa: expected_nil_fallback,
              exp_il: expected_nil_fallback }
    data4 = { seq: sequences(:sequence4),
              exp_fa: { 'num' => { 'all' => 1, 'EC' => 1, 'GO' => 1 }, 'data' => { 'GO:0005576' => 1, 'GO:0000287' => 1, 'GO:0004634' => 1, 'GO:0000015' => 1, 'GO:0006096' => 1, 'EC:4.2.1.11' => 1, 'GO:0009986' => 1 } },
              exp_il: expected_nil_fallback }

    [data1, data2, data3, data4].each do |seq|
      assert_equal seq[:exp_fa], seq[:seq].calculate_fa(false)
      assert_equal seq[:exp_il], seq[:seq].calculate_fa(true)
      assert_equal seq[:exp_il], seq[:seq].calculate_fa
    end
  end

  test 'should give correct result for calculate_fa if hash, string given' do
    sequence = Sequence.new(
      fa: { 'num' => { 'all' => 1, 'EC' => 0, 'GO' => 0 }, 'data' => {} },
      fa_il: { 'num' => { 'all' => 2, 'EC' => 0, 'GO' => 0 }, 'data' => {} }
    )
    sequenceStr = Sequence.new(
      fa: '{"num":{"all":1, "EC" : 0, "GO" : 0 }, "data" : {} }',
      fa_il: '{ "num" : { "all" : 2, "EC" : 0, "GO" : 0 }, "data" : {} }'
    )
    assert_equal ({ 'num' => { 'all' => 1, 'EC' => 0, 'GO' => 0 }, 'data' => {} }), sequence.calculate_fa(false)
    assert_equal ({ 'num' => { 'all' => 2, 'EC' => 0, 'GO' => 0 }, 'data' => {} }), sequence.calculate_fa(true)

    assert_equal sequence.calculate_fa(false), sequenceStr.calculate_fa(false)
    assert_equal sequence.calculate_fa(true), sequenceStr.calculate_fa(true)

    # Doube check because JSON decoding is cached
    assert_equal ({ 'num' => { 'all' => 1, 'EC' => 0, 'GO' => 0 }, 'data' => {} }), sequenceStr.calculate_fa(false)
    assert_equal ({ 'num' => { 'all' => 2, 'EC' => 0, 'GO' => 0 }, 'data' => {} }), sequenceStr.calculate_fa(true)
  end

  test 'should give correct result for calculate_fa if no data' do
    sequence = Sequence.new(
      fa: false,
      fa_il: false
    )

    2.times do
      assert_nil sequence.calculate_fa(false)
      assert_nil sequence.calculate_fa(true)
      assert_nil sequence.fa
      assert_nil sequence.fa_il
    end
  end

  test 'should give correct result for single_search' do
    sequence1 = sequences(:sequence1)
    sequence2 = sequences(:sequence2)
    assert_raises(ArgumentError) { Sequence.single_search('AAAAAA', 5) }
    assert_raises(SequenceTooShortError) { Sequence.single_search('AAAA') }
    assert_nil Sequence.single_search('UNKNOWN')
    assert_equal sequence1, Sequence.single_search('AALER')
    assert_equal sequence1, Sequence.single_search('AALER', true)
    assert_equal sequence1, Sequence.single_search('AALER', false)
    assert_equal sequence1, Sequence.single_search('AAIER')
    assert_equal sequence1, Sequence.single_search('AAIER', true)
    assert_equal sequence2, Sequence.single_search('AAIER', false)
  end

  test 'should eager load with single_search' do
    sequence = Sequence.single_search('AALER')
    assert sequence.peptides.loaded?
    assert_not sequence.original_peptides.loaded?
    assert sequence.peptides.first.association(:uniprot_entry).loaded?
    assert sequence.peptides.first.uniprot_entry.association(:taxon).loaded?
    assert sequence.peptides.first.uniprot_entry.ec_cross_references.loaded?
    assert sequence.peptides.first.uniprot_entry.go_cross_references.loaded?
  end

  test 'should give correct result for advanced_single_search' do
    sequence1 = sequences(:sequence1)
    sequence2 = sequences(:sequence2)
    assert_raises(ArgumentError) { Sequence.advanced_single_search('AAAAAA', 5) }
    assert_raises(NoMatchesFoundError) { Sequence.advanced_single_search('AAAAAA') }
    assert_raises(NoMatchesFoundError) { Sequence.advanced_single_search('AAAAARA') }
    assert_raises(SequenceTooShortError) { Sequence.advanced_single_search('AARAAR') }
    assert_equal [sequence1, sequence1], Sequence.advanced_single_search('AALERAAIER').to_a
    assert_equal [sequence1, sequence1], Sequence.advanced_single_search('AALERAAIER', true).to_a
    assert_equal [sequence1, sequence2], Sequence.advanced_single_search('AALERAAIER', false).to_a
  end

  test 'should eager load with advanced_single_search' do
    sequence = Sequence.advanced_single_search('AALERAAIER').first
    assert sequence.peptides.loaded?
    assert_not sequence.original_peptides.loaded?
    assert sequence.peptides.first.association(:uniprot_entry).loaded?
    assert sequence.peptides.first.uniprot_entry.association(:taxon).loaded?
    assert sequence.peptides.first.uniprot_entry.association(:lineage).loaded?
  end

  test 'should give correct result for peptides_relation_name' do
    assert_equal :peptides, Sequence.peptides_relation_name(true)
    assert_equal :original_peptides, Sequence.peptides_relation_name(false)
    assert_raises(ArgumentError) { Sequence.peptides_relation_name(5) }
  end

  test 'should give correct result for lca_t_relation_name' do
    assert_equal :lca_il_t, Sequence.lca_t_relation_name(true)
    assert_equal :lca_t, Sequence.lca_t_relation_name(false)
    assert_raises(ArgumentError) { Sequence.lca_t_relation_name(5) }
  end

  test 'should give correct result for list_sequences' do
    assert_equal [], Sequence.list_sequences([55])
    assert_equal ['AALER'], Sequence.list_sequences([1])
    assert_equal %w[AALER AAIER].sort, Sequence.list_sequences([1, 2]).sort
  end

  test 'should not crash with empty input list_sequences' do
    assert_equal [], Sequence.list_sequences([])
  end

  test 'should give correct result for filter_unique_uniprot_peptides' do
    assert_equal [], Sequence.filter_unique_uniprot_peptides([2, 1], 1)
    assert_equal [1, 2].sort, Sequence.filter_unique_uniprot_peptides([2, 1], 2)
  end

  test 'should give correct result for boolean?' do
    assert_not Sequence.boolean? 0
    assert_not Sequence.boolean? 55
    assert_not Sequence.boolean? []
    assert_not Sequence.boolean? 'true'
    assert_not Sequence.boolean? nil
    assert Sequence.boolean? true
    assert Sequence.boolean? false
  end

  test 'should give correct result for missed_cleavage' do
    assert_equal 2, Sequence.missed_cleavage('AAILERAGGAR', false).lca
    assert_equal ({ 'num' => { 'all' => 1, 'EC' => 0, 'GO' => 0, 'IPR' => 0 }, 'data' => {} }), Sequence.missed_cleavage('AAILERAGGAR', false).fa
    assert_nil Sequence.missed_cleavage('AAILERAGGAR', false).fa_il
    assert_nil Sequence.missed_cleavage('AAILERAGGAR', false).lca_il
    assert_equal 2, Sequence.missed_cleavage('AAILERAGGAR', true).lca_il
    assert_nil Sequence.missed_cleavage('AAILERAGGAR', true).lca
    assert_equal 2, Sequence.missed_cleavage('AALLERAGGAR', true).lca_il
    assert_equal ({ 'num' => { 'all' => 1, 'EC' => 0, 'GO' => 0, 'IPR' => 0 }, 'data' => {} }), Sequence.missed_cleavage('AALLERAGGAR', true).fa_il
    assert_nil      Sequence.missed_cleavage('AALLERAGGAR', true).lca
    assert_nil      Sequence.missed_cleavage('AALLERAGGAR', true).fa
    assert_nil      Sequence.missed_cleavage('AALLERAGGAR', false)
    assert_nil      Sequence.missed_cleavage('AAIIERAGGAR', false)
  end
end
