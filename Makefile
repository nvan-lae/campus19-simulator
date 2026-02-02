COMPOSE_FILE = docker-compose.yml

GREEN = \033[0;32m
RESET = \033[0m

all: up

# Generate SSL certificates for backend
certs:
	@echo "$(GREEN)Generating SSL certificates...$(RESET)"
	@mkdir -p backend/secrets
	@if [ ! -f backend/secrets/key.pem ]; then \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout backend/secrets/key.pem \
		-out backend/secrets/cert.pem \
		-subj "/C=BE/ST=Antwerp/L=Antwerp/O=42/OU=Student/CN=localhost"; \
	fi

# Build and start the containers in the background
up: certs
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

# Run database migrations (Required on new machines/fresh volumes)
migrate:
	@echo "$(GREEN)Running database migrations...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) exec backend npx prisma migrate dev

# Start everything and initialize the database (First time setup)
init:
	@make up
	@echo "$(GREEN)Waiting for Database to start...$(RESET)"
	@sleep 5
	@make migrate

# Stop containers and remove networks
clean:
	@echo "$(GREEN)Cleaning containers and networks...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) down --rmi all --remove-orphans

# Full clean including volumes
fclean:
	@echo "$(GREEN)Full clean: removing containers, images, and volumes...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans

# Prune unused Docker resources
prune:
	@echo "$(GREEN)Pruning unused Docker resources...$(RESET)"
	docker system prune -f

# Rebuild everything from scratch
re: fclean all

.PHONY: all up down logs update shell-backend shell-frontend shell-db clean fclean re prune
