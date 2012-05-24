class CreateDatasets < ActiveRecord::Migration
  def self.up
    create_table :datasets do |t|
      t.string :environment
      t.string :reference
      t.string :url
      t.string :project_website

      t.timestamps
    end
  end

  def self.down
    drop_table :datasets
  end
end
