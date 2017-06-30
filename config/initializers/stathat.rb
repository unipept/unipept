ActiveSupport::Notifications.subscribe 'process_action.action_controller' do |_name, start, finish, _id, payload|
  duration = (finish - start) * 1000

  if %w[pept2taxa pept2lca taxa2lca pept2prot taxonomy].include? payload[:action]
    if Rails.application.config.unipept_API_logging
      StatHat::API.ez_post_value("API - #{payload[:action]} duration", Rails.application.config.unipept_stathat_key, duration)
    end
  end
end
