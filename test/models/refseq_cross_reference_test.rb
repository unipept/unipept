# == Schema Information
#
# Table name: refseq_cross_references
#
#  id               :integer          unsigned, not null, primary key
#  uniprot_entry_id :integer          unsigned, not null
#  protein_id       :string(25)
#  sequence_id      :string(25)
#

require 'test_helper'

class RefseqCrossReferenceTest < ActiveSupport::TestCase
  test 'should fail to create new RefseqCrossReference' do
    assert_not RefseqCrossReference.new.save
  end

  test 'should raise error on save' do
    refseqcrossreference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { refseqcrossreference.save }
  end

  test 'should raise error on uniprot_entry_id change' do
    refseqcrossreference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { refseqcrossreference.update_attribute(:uniprot_entry_id, 35) }
  end

  test 'should raise error on protein_id change' do
    refseqcrossreference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { refseqcrossreference.update_attribute(:protein_id, '35') }
  end

  test 'should raise error on sequence_id change' do
    refseqcrossreference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) { refseqcrossreference.update_attribute(:sequence_id, '35') }
  end

  test 'should raise error on delete' do
    refseqcrossreference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { refseqcrossreference.delete }
  end

  test 'should raise error on destroy' do
    refseqcrossreference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { refseqcrossreference.destroy }
  end
end
