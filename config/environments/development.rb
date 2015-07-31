UnipeptWeb::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb

  # In the development environment your application's code is reloaded on
  # every request.  This slows down response time but is perfect for development
  # since you don't have to restart the webserver when you make code changes.
  config.cache_classes = false

  config.eager_load = false

  # Show full error reports and disable caching
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.delivery_method = :sendmail

  # Print deprecation notices to the Rails logger
  config.active_support.deprecation = :log

  # Only use best-standards-support built into browsers
  config.action_dispatch.best_standards_support = :builtin

  # Do not compress assets
  config.assets.compress = false

  # Expands the lines which load the assets
  config.assets.debug = true

  # Raise exception on mass assignment protection for Active Record models
  config.active_record.mass_assignment_sanitizer = :strict

  # Log the query plan for queries taking more than this (works
  # with SQLite, MySQL, and PostgreSQL)
  # config.active_record.auto_explain_threshold_in_seconds = 30

  # enable google analytics
  config.unipept_analytics = false
  config.unipept_analytics_key = ""

  # if authentication is disabled, a guest user will always be signed in
  config.unipept_enable_auth = false

  # enable API logging
  config.unipept_API_logging = false
  config.unipept_stathat_key = ""

  # enable error emails
  config.unipept_error_mails = false
  config.unipept_error_mails_addresses = [""]
end

if Rails.application.config.unipept_error_mails
  UnipeptWeb::Application.config.middleware.use ExceptionNotification::Rack,
                                                throttle: {
                                                  notifier: 'email',
                                                  notifier_options: {
                                                    email_prefix: '[Unipept-dev] ',
                                                    sender_address: %("Unipept-dev" <unipept@ugent.be>),
                                                    exception_recipients: Rails.application.config.unipept_error_mails_addresses
                                                  },
                                                  per_hour: 1
                                                }
end
