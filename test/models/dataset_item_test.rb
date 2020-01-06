# == Schema Information
#
# Table name: dataset_items
#
#  id         :integer          unsigned, not null, primary key
#  dataset_id :integer          unsigned
#  name       :string(160)
#  data       :text(16777215)   not null
#  order      :integer
#

require 'test_helper'

class DatasetItemTest < ActiveSupport::TestCase
  test 'should not save datasetitem without name' do
    datasetitem = dataset_items(:datasetitem1)
    datasetitem.name = nil
    assert_not datasetitem.save, 'Saved the datasetitem without name'
  end

  test 'should not save dataset with long name' do
    datasetitem = dataset_items(:datasetitem1)
    datasetitem.name = 'a' * 161
    assert_not datasetitem.save, 'Saved the dataset with long name'
  end

  test 'should not save datasetitem without data' do
    datasetitem = dataset_items(:datasetitem1)
    datasetitem.data = nil
    assert_not datasetitem.save, 'Saved the datasetitem without data'
  end

  test 'should not save dataset with long data' do
    datasetitem = dataset_items(:datasetitem1)
    datasetitem.data = 'a' * 16_777_216
    assert_not datasetitem.save, 'Saved the dataset with long data'
  end

  test 'should save datasetitem with valid fields' do
    datasetitem = DatasetItem.new
    datasetitem.dataset_id = 1
    datasetitem.name = 'test'
    datasetitem.data = 'test'
    assert datasetitem.save, 'Unable to save the datasetitem with valid fields'
  end

  test 'should delete datasetitem on parent dataset delete' do
    dataset = datasets(:dataset1)
    assert !dataset.dataset_items.empty?
    datasetitem = dataset.dataset_items.first
    dataset.destroy
    assert_raises(ActiveRecord::RecordNotFound) { datasetitem.reload }
  end
end
