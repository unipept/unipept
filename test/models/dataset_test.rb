# == Schema Information
#
# Table name: datasets
#
#  id              :integer          unsigned, not null, primary key
#  environment     :string(160)
#  reference       :string(500)
#  url             :string(200)
#  project_website :string(200)
#

require 'test_helper'

class DatasetTest < ActiveSupport::TestCase
  test 'should not save dataset without environment' do
    dataset = datasets(:dataset1)
    dataset.environment = nil
    assert_not dataset.save, 'Saved the dataset without environment'
  end

  test 'should not save dataset with long environment' do
    dataset = datasets(:dataset1)
    dataset.environment = 'a' * 161
    assert_not dataset.save, 'Saved the dataset with long environment'
  end

  test 'should not save dataset without reference' do
    dataset = datasets(:dataset1)
    dataset.reference = nil
    assert_not dataset.save, 'Saved the dataset without reference'
  end

  test 'should not save dataset with long reference' do
    dataset = datasets(:dataset1)
    dataset.reference = 'a' * 501
    assert_not dataset.save, 'Saved the dataset with long reference'
  end

  test 'should not save dataset without url' do
    dataset = datasets(:dataset1)
    dataset.url = nil
    assert_not dataset.save, 'Saved the dataset without url'
  end

  test 'should not save dataset with long url' do
    dataset = datasets(:dataset1)
    dataset.url = 'a' * 201
    assert_not dataset.save, 'Saved the dataset with long url'
  end

  test 'should not save dataset without project_website' do
    dataset = datasets(:dataset1)
    dataset.project_website = nil
    assert_not dataset.save, 'Saved the dataset without project_website'
  end

  test 'should not save dataset with long project_website' do
    dataset = datasets(:dataset1)
    dataset.project_website = 'a' * 201
    assert_not dataset.save, 'Saved the dataset with long project_website'
  end

  test 'should save dataset with valid fields' do
    dataset = Dataset.new
    dataset.environment = 'test'
    dataset.reference = 'test'
    dataset.url = 'test'
    dataset.project_website = 'test'
    assert dataset.save, 'Unable to save the dataset with valid fields'
  end
end
