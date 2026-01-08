COMPOSE_FILE = docker-compose.yml

GREEN = \033[0;32m
RESET = \033[0m

all: up

# Build and start the containers in the background
up:
	@echo "$(GREEN)Building and starting containers...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) up -d --build

# Stop the containers
down:
	@echo "$(GREEN)Stopping containers...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) down

# Show logs (follow mode)
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

# Updates dependencies inside running containers (Use this after git pull!)
update:
	@echo "$(GREEN)Updating Backend dependencies...$(RESET)"
	@docker-compose -f $(COMPOSE_FILE) exec backend npm install
	@echo "$(GREEN)Updating Frontend dependencies...$(RESET)"
	@docker-compose -f $(COMPOSE_FILE) exec frontend npm install
	@echo "$(GREEN)Done! Containers are up to date.$(RESET)"

# Enter the backend container shell
shell-backend:
	docker-compose -f $(COMPOSE_FILE) exec backend sh

# Enter the frontend container shell
shell-frontend:
	docker-compose -f $(COMPOSE_FILE) exec frontend sh

# Enter the database (Postgres) shell
shell-db:
	docker-compose -f $(COMPOSE_FILE) exec postgres psql -U postgres -d transcendence_db

# Stop containers and remove networks
clean:
	@echo "$(GREEN)Cleaning containers and networks...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) down --rmi all --remove-orphans

# Rebuild everything from scratch
re: fclean all

.PHONY: all up down logs update shell-backend shell-frontend shell-db clean fclean re prune
