module ApiHelper
  def lineage_info(lineage, include_names = false)
    order = if @v1
              Lineage::ORDER_V1
            else
              Lineage::ORDER
            end

    ids = order.map { |o| lineage.try(o) }
    ids = ids.map { |i| i.nil? || i == -1 ? nil : i.abs }
    id_names = order.map { |s| s == :class_ ? 'class_id' : "#{s}_id" }

    if include_names
      names = order.map { |s| s == :class_ ? 'class_name' : "#{s}_name" }
      lineage_arr = lineage.to_a
      # repair array to be consistent with ranks that have been added or deleted in v2 of the API
      if @v1
        lineage_arr = lineage_arr.insert(9, '')
        lineage_arr = lineage_arr.insert(14, '')
        lineage_arr.delete_at(26)
      end
      a = names.zip(lineage_arr)
      b = id_names.zip(ids)
      lineage_info = Hash[b.zip(a).flatten(1)]
    else
      lineage_info = Hash[id_names.zip(ids)]
    end

    lineage_info
  end
end
