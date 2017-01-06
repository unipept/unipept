# == Schema Information
#
# Table name: taxons
#
#  id          :integer          not null, primary key
#  name        :string(120)      not null
#  rank        :string(16)
#  parent_id   :integer
#  valid_taxon :binary(1)        default("b'1'"), not null
#

require 'test_helper'

class TaxonTest < ActiveSupport::TestCase
  test 'should fail to create new Taxon' do
    assert_not Taxon.new.save
  end

  test 'should raise error on save' do
    taxon = taxons(:taxon1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { taxon.save }
  end

  test 'should raise error on name change' do
    taxon = taxons(:taxon1)
    assert_raises(ActiveRecord::ActiveRecordError) { taxon.update_attribute(:name, '35') }
  end

  test 'should raise error on rank change' do
    taxon = taxons(:taxon1)
    assert_raises(ActiveRecord::ActiveRecordError) { taxon.update_attribute(:rank, '35') }
  end

  test 'should raise error on parent_id change' do
    taxon = taxons(:taxon1)
    assert_raises(ActiveRecord::ActiveRecordError) { taxon.update_attribute(:parent_id, 35) }
  end

  test 'should raise error on valid_taxon change' do
    taxon = taxons(:taxon1)
    assert_raises(ActiveRecord::ActiveRecordError) { taxon.update_attribute(:valid_taxon, '35') }
  end

  test 'should raise error on delete' do
    taxon = taxons(:taxon1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { taxon.delete }
  end

  test 'should raise error on destroy' do
    taxon = taxons(:taxon1)
    assert_raises(ActiveRecord::ReadOnlyRecord) { taxon.destroy }
  end

  test 'should sort by id' do
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    list = [taxon2, taxon1]
    list.sort!
    assert list[0].id <= list[1].id
  end
end
