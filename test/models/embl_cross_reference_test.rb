# == Schema Information
#
# Table name: embl_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  protein_id       :string(25)
#  sequence_id      :string(25)
#

require 'test_helper'

class EmblCrossReferenceTest < ActiveSupport::TestCase

  test "should rails error on create new EmblCrossReference" do
    assert_raises(ActiveRecord::ReadOnlyRecord) {EmblCrossReference.new.save}
  end

  test "should raise error on save" do
    emblcrossreference = embl_cross_references(:emblcrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {emblcrossreference.save}
  end

  test "should raise error on uniprot_entry_id change" do
    emblcrossreference = embl_cross_references(:emblcrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) {emblcrossreference.update_attribute(:uniprot_entry_id, 35)}
  end

  test "should raise error on protein_id change" do
    emblcrossreference = embl_cross_references(:emblcrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) {emblcrossreference.update_attribute(:protein_id, "35")}
  end

  test "should raise error on sequence_id change" do
    emblcrossreference = embl_cross_references(:emblcrossreference1)
    assert_raises(ActiveRecord::ActiveRecordError) {emblcrossreference.update_attribute(:sequence_id, "35")}
  end

  test "should raise error on delete" do
    emblcrossreference = embl_cross_references(:emblcrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {emblcrossreference.delete}
  end

  test "should raise error on destroy" do
    emblcrossreference = embl_cross_references(:emblcrossreference1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {emblcrossreference.destroy}
  end

  test "should return an empty set when calling get_sequence_ids on unknow sequence_id" do
    returnset = EmblCrossReference.get_sequence_ids("unknown id")
    assert returnset.kind_of?(Set), "No set was returned"
    assert returnset.empty?, "The set wasn't empty"
  end

  test "should return a correct result when calling get_sequence_ids on known id" do
    returnset = EmblCrossReference.get_sequence_ids("sid")
    assert returnset.kind_of?(Set), "No set was returned"
    assert returnset.include?(2), "The result was incorrect"
  end

end
