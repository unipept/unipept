#!/bin/bash

bundle exec rake db:setup
bundle exec rake db:migrate
bundle exec rails s

