setup:
	heroku config:set NPM_CONFIG_PRODUCTION=false
deploy:
	git push heroku seek:master
