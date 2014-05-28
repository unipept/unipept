ActiveSupport::Notifications.subscribe "process_action.action_controller" do |name, start, finish, id, payload|
  duration = (finish - start) * 1000

  if ['pept2taxa', 'pept2lca','taxa2lca','pept2prot'].include? payload[:action]
    StatHat::API.ez_post_value("API - #{payload[:action]} duration", "unipept@ugent.be", duration)
  end
end
