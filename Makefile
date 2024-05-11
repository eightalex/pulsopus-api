up:
	docker-compose up -d --build

stop:
	docker stop $(docker ps -a -q)

prune:
	docker system prune \
	&& docker system prune -a