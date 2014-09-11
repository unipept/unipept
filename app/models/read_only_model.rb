module ReadOnlyModel
  # Forces model to be read-only by raising errors on write operations.
  # taken from http://www.rollnorocks.com/2013/01/implementing-read-only-models-with-activerecord/

  extend ActiveSupport::Concern

  # make all attributes read only
  included do
    attr_readonly(*column_names)
  end

  def readonly?
    true # Does not block destroy or delete
  end

  def destroy
    raise ActiveRecord::ReadOnlyRecord
  end

  def delete
    raise ActiveRecord::ReadOnlyRecord
  end
end
