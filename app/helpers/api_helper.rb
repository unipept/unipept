module ApiHelper
  def lineage_info(lineage, include_names = false)
    if @v1
      order = Lineage::ORDER_V1
    else
      order = Lineage::ORDER
    end

    ids = order.map { |o| lineage.try(o) }
    ids = ids.map { |i| i.nil? || i == -1 ? nil : i.abs }
    id_names = order.map { |s| s == :class_ ? 'class_id' : "#{s}_id" }

    if include_names
      names = order.map { |s| s == :class_ ? 'class_name' : "#{s}_name" }
      a = names.zip(lineage.to_a)
      b = id_names.zip(ids)
      lineage_info = Hash[b.zip(a).flatten(1)]
    else
      lineage_info = Hash[id_names.zip(ids)]
    end

    lineage_info
  end
end
