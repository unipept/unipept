module ApiHelper

  def lineage_info(lineage, include_names=false)
    ids = Lineage::ORDER.map {|o| lineage.try(o) }
    id_names = Lineage::ORDER.map {|s| s == :class_ ? "class_id" : "#{s}_id"}

    if include_names
      names = Lineage::ORDER.map {|s| s == :class_ ? "class_name" : "#{s}_name"}
      a = names.zip(lineage.to_a)
      b = id_names.zip(ids)
      lineage_info = Hash[b.zip(a).flatten(1)]
    else
      lineage_info = Hash[id_names.zip(ids)]
    end

    lineage_info
  end

end
