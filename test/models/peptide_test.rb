# == Schema Information
#
# Table name: peptides
#
#  id                   :integer          not null, primary key
#  sequence_id          :integer          not null
#  original_sequence_id :integer          not null
#  uniprot_entry_id     :integer          not null
#  position             :integer          not null
#

require 'test_helper'

class PeptideTest < ActiveSupport::TestCase

  test "should fail to create new peptide" do
    assert_not Peptide.new.save
  end

  test "should raise error on save" do
    peptide = peptides(:pept1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {peptide.save}
  end

  test "should raise error on sequence_id change" do
    peptide = peptides(:pept1)
    assert_raises(ActiveRecord::ActiveRecordError) {peptide.update_attribute(:sequence_id, 35)}
  end

  test "should raise error on delete" do
    peptide = peptides(:pept1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {peptide.delete}
  end

  test "should raise error on destroy" do
    peptide = peptides(:pept1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {peptide.destroy}
  end

end
