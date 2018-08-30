# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path
# Add Yarn node_modules folder to the asset load path.
Rails.application.config.assets.paths << Rails.root.join('node_modules')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
# Rails.application.config.assets.precompile += %w( admin.js admin.css )

# Enable the asset pipeline
Rails.application.config.assets.enabled = true

Rails.application.config.assets.precompile += ['workers/pancore_worker.js', 'workers/mygenome_worker.js', '*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2']
Rails.application.config.assets.nodigest = ['workers/pancore_worker.js', 'workers/mygenome_worker.js']
Rails.application.config.assets.nodigest_fonts = ['glyphicons-halflings-regular.eot', 'glyphicons-halflings-regular.svg', 'glyphicons-halflings-regular.ttf', 'glyphicons-halflings-regular.woff', 'glyphicons-halflings-regular.woff2']

Rails.application.config.assets.paths << "#{Rails}/vendor/assets/fonts"
