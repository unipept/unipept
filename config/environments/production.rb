UnipeptWeb::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb

  # The production environment is meant for finished, "live" apps.
  # Code is not reloaded between requests
  config.cache_classes = true

  config.eager_load = true

  # Full error reports are disabled and caching is turned on
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Attempt to read encrypted secrets from `config/secrets.yml.enc`.
  # Requires an encryption key in `ENV["RAILS_MASTER_KEY"]` or
  # `config/secrets.yml.key`.
  config.read_encrypted_secrets = false

  # Specifies the header that your server uses for sending files
  config.action_dispatch.x_sendfile_header = 'X-Sendfile'

  # For nginx:
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect'

  # If you have no front-end server that supports something like X-Sendfile,
  # just comment this out and Rails will serve the files

  # See everything in the log (default is :info)
  config.log_level = :debug

  # Use a different logger for distributed setups
  # config.logger = SyslogLogger.new

  # Use a different cache store in production
  # config.cache_store = :mem_cache_store

  # Enable Rails's static asset server
  config.public_file_server.enabled = true

  # Enable serving of images, stylesheets, and javascripts from an asset server
  # config.action_controller.asset_host = "http://assets.example.com"

  # Disable delivery errors, bad email addresses will be ignored
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.delivery_method = :sendmail

  # Enable threaded mode
  # config.threadsafe!

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found)
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners
  config.active_support.deprecation = :notify

  # Compress JavaScripts and CSS
  # This is now handled by webpack itself and needs to be changed in the webpack config
  config.assets.compress = false
  #config.assets.js_compressor = Uglifier.new(harmony: true, :mangle => false, :compress => false)

  # Don't fallback to assets pipeline if a precompiled asset is missed
  config.assets.compile = false

  # Generate digests for assets URLs
  config.assets.digest = true

  # Store uploaded files on the local file system (see config/storage.yml for options)
  config.active_storage.service = :local

  # Action Cable endpoint configuration
  # Mount Action Cable outside main process or domain
  # config.action_cable.mount_path = nil
  # config.action_cable.url = 'wss://example.com/cable'
  # config.action_cable.allowed_request_origins = [ 'http://example.com', /http:\/\/example.*/ ]

  # Prepend all log lines with the following tags.
  config.log_tags = [:request_id]

  # Use a different logger for distributed setups.
  # require 'syslog/logger'
  # config.logger = ActiveSupport::TaggedLogging.new(Syslog::Logger.new 'app-name')

  if ENV['RAILS_LOG_TO_STDOUT'].present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger = ActiveSupport::TaggedLogging.new(logger)
  end

  # enable google analytics
  config.unipept_analytics = true
  config.unipept_analytics_key = 'UA-22900446-1'

  # if authentication is disabled, a guest user will always be signed in
  config.unipept_enable_auth = true

  # enable API logging
  config.unipept_API_logging = true
  config.unipept_stathat_key = 'unipept@ugent.be'

  # enable error emails
  config.unipept_error_mails = true
  config.unipept_error_mails_addresses = ['unipept@ugent.be']
end

if Rails.application.config.unipept_error_mails
  UnipeptWeb::Application.config.middleware.use ExceptionNotification::Rack,
                                                email: {
                                                    email_prefix: '[Unipept] ',
                                                    sender_address: %("Unipept" <unipept@ugent.be>),
                                                    exception_recipients: Rails.application.config.unipept_error_mails_addresses
                                                }
end
