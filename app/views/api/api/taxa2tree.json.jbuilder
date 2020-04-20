if @link and @gist
  json.gist @gist
else
  json.partial! partial: 'api/api/taxa2tree', locals: { item: @root }
end
