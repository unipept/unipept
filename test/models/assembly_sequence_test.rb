# == Schema Information
#
# Table name: assembly_sequences
#
#  id                :integer          not null, primary key
#  assembly_id       :integer          not null
#  sequence_type     :string(13)       default("na"), not null
#  genbank_accession :string(25)       not null
#

require 'test_helper'

class AssemblySequenceTest < ActiveSupport::TestCase
  test 'should fail to create new assembly sequence' do
    assert_raises(ActiveRecord::ReadOnlyRecord) { AssemblySequence.new.save }
  end

  test 'should raise error on save' do
    as = assembly_sequences(:assemblysequence1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { as.save }
  end

  test 'should raise error on assembly_id change' do
    as = assembly_sequences(:assemblysequence1)
    assert_raises(ActiveRecord::ActiveRecordError) { as.update_attribute(:assembly_id, 35) }
  end

  test 'should raise error on sequence_type change' do
    as = assembly_sequences(:assemblysequence1)
    assert_raises(ActiveRecord::ActiveRecordError) { as.update_attribute(:sequence_type, '35') }
  end

  test 'should raise error on genbank_accession change' do
    as = assembly_sequences(:assemblysequence1)
    assert_raises(ActiveRecord::ActiveRecordError) { as.update_attribute(:genbank_accession, '35') }
  end

  test 'should raise error on delete' do
    as = assembly_sequences(:assemblysequence1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { as.delete }
  end

  test 'should raise error on destroy' do
    as = assembly_sequences(:assemblysequence1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { as.destroy }
  end
end
