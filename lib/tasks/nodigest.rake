namespace :assets do
  task nodigest: :environment do
    assets_path = File.join(Rails.root, 'public', Rails.application.config.assets.prefix)
    Rails.application.config.assets.nodigest.each do |asset|
      source = File.join('app/assets/javascripts', asset)
      dest = File.join(assets_path, asset)
      FileUtils.copy_file(source, dest)
    end
    Rails.application.config.assets.nodigest_fonts.each do |asset|
      source = File.join('vendor/assets/fonts/bootstrap', asset)
      dest = File.join(assets_path, 'bootstrap', asset)
      FileUtils.copy_file(source, dest)
    end
  end
end
