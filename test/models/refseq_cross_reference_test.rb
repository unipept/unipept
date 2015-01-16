# == Schema Information
#
# Table name: refseq_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  protein_id       :string(15)
#  sequence_id      :string(15)
#

require 'test_helper'

class RefseqCrossReferenceTest < ActiveSupport::TestCase

  test "should rails error on create new RefseqCrossReference" do
    assert_raises(ActiveRecord::ReadOnlyRecord) {RefseqCrossReference.new.save}
  end

  test "should raise error on save" do
    RefseqCrossReference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {RefseqCrossReference.save}
  end

  test "should raise error on uniprot_entry_id change" do
    RefseqCrossReference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) {RefseqCrossReference.update_attribute(:uniprot_entry_id, 35)}
  end

  test "should raise error on protein_id change" do
    RefseqCrossReference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) {RefseqCrossReference.update_attribute(:protein_id, "35")}
  end

  test "should raise error on sequence_id change" do
    RefseqCrossReference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) {RefseqCrossReference.update_attribute(:sequence_id, "35")}
  end

  test "should raise error on delete" do
    RefseqCrossReference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {RefseqCrossReference.delete}
  end

  test "should raise error on destroy" do
    RefseqCrossReference = refseq_cross_references(:refseqcrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {RefseqCrossReference.destroy}
  end

end
