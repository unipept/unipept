# == Schema Information
#
# Table name: uniprot_entries
#
#  id                       :integer          not null, primary key
#  uniprot_accession_number :string(8)        not null
#  version                  :integer          not null
#  taxon_id                 :integer          not null
#  type                     :string(9)        not null
#  protein                  :text             not null
#

require 'test_helper'

class UniprotEntryTest < ActiveSupport::TestCase

  test "should rails error on create new UniprotEntry" do
    assert_raises(ActiveRecord::ReadOnlyRecord) {UniprotEntry.new.save}
  end

  test "should raise error on save" do
    uniprotentry = uniprot_entries(:uniprotentry1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {uniprotentry.save}
  end

  test "should raise error on uniprot_accession_number change" do
    uniprotentry = uniprot_entries(:uniprotentry1)
    assert_raises(ActiveRecord::ActiveRecordError) {uniprotentry.update_attribute(:uniprot_accession_number, "35")}
  end

  test "should raise error on version change" do
    uniprotentry = uniprot_entries(:uniprotentry1)
    assert_raises(ActiveRecord::ActiveRecordError) {uniprotentry.update_attribute(:version, 35)}
  end

  test "should raise error on taxon_id change" do
    uniprotentry = uniprot_entries(:uniprotentry1)
    assert_raises(ActiveRecord::ActiveRecordError) {uniprotentry.update_attribute(:taxon_id, 35)}
  end

  test "should raise error on type change" do
    uniprotentry = uniprot_entries(:uniprotentry1)
    assert_raises(ActiveRecord::ActiveRecordError) {uniprotentry.update_attribute(:type, "35")}
  end

  test "should raise error on protein change" do
    uniprotentry = uniprot_entries(:uniprotentry1)
    assert_raises(ActiveRecord::ActiveRecordError) {uniprotentry.update_attribute(:protein, "35")}
  end

  test "should raise error on delete" do
    uniprotentry = uniprot_entries(:uniprotentry1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {uniprotentry.delete}
  end

  test "should raise error on destroy" do
    uniprotentry = uniprot_entries(:uniprotentry1)
    assert_raises(ActiveRecord::ReadOnlyRecord) {uniprotentry.destroy}
  end

  test "should give correct result for protein_contains?" do
    elaba = uniprot_entries(:uniprotentry1)
    eiaba = uniprot_entries(:uniprotentry2)
    assert elaba.protein_contains?("ELABA", true)
    assert elaba.protein_contains?("ELABA", false)
    assert_not elaba.protein_contains?("EIABA", false)
    assert elaba.protein_contains?("EIABA", true)
    assert eiaba.protein_contains?("ELABA", true)
    assert_not eiaba.protein_contains?("ELABA", false)
    assert eiaba.protein_contains?("EIABA", false)
    assert eiaba.protein_contains?("EIABA", true)
  end

end
