# **************************************************************************** #
#                                   COLORS                                     #
# **************************************************************************** #

RESET   = \033[0m
RED     = \033[1;31m
GREEN   = \033[1;32m
YELLOW  = \033[1;33m
BLUE    = \033[1;34m
PURPLE  = \033[1;35m

# **************************************************************************** #
#                                   PROJECT                                    #
# **************************************************************************** #

NAME        = transcendence
COMPOSE     = docker compose
COMPOSE_FILE= docker-compose.yml

# **************************************************************************** #
#                                   DEFAULT                                    #
# **************************************************************************** #

all: up

# **************************************************************************** #
#                                   SETUP                                      #
# **************************************************************************** #

certs:
	@echo "$(BLUE)[$(NAME)] Generating SSL certificates...$(RESET)"
	@mkdir -p backend/secrets
	@if [ ! -f backend/secrets/key.pem ]; then \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout backend/secrets/key.pem \
		-out backend/secrets/cert.pem \
		-subj "/C=BE/ST=Antwerp/L=Antwerp/O=42/OU=Student/CN=localhost"; \
	fi
	@echo "$(GREEN)[$(NAME)] Certificates ready$(RESET)"

# **************************************************************************** #
#                                CONTAINERS                                    #
# **************************************************************************** #

up: certs
	@echo "$(PURPLE)[$(NAME)] Starting containers...$(RESET)"
	@$(COMPOSE) -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)[$(NAME)] Stack is up$(RESET)"

down:
	@echo "$(YELLOW)[$(NAME)] Stopping containers...$(RESET)"
	@$(COMPOSE) -f $(COMPOSE_FILE) down
	@echo "$(GREEN)[$(NAME)] Containers stopped$(RESET)"

logs:
	@$(COMPOSE) -f $(COMPOSE_FILE) logs -f

# **************************************************************************** #
#                              MAINTENANCE                                     #
# **************************************************************************** #

update:
	@echo "$(BLUE)[$(NAME)] Updating shared dependencies...$(RESET)"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec backend sh -c "cd ../shared && npm install && npm run build"
	@echo "$(BLUE)[$(NAME)] Updating backend dependencies...$(RESET)"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec backend npm install
	@echo "$(BLUE)[$(NAME)] Updating frontend dependencies...$(RESET)"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec frontend npm install
	@echo "$(GREEN)[$(NAME)] Update complete$(RESET)"

# **************************************************************************** #
#                                 SHELLS                                       #
# **************************************************************************** #

shell-backend:
	@$(COMPOSE) -f $(COMPOSE_FILE) exec backend sh

shell-frontend:
	@$(COMPOSE) -f $(COMPOSE_FILE) exec frontend sh

shell-db:
	@$(COMPOSE) -f $(COMPOSE_FILE) exec postgres psql -U postgres -d transcendence_db

# **************************************************************************** #
#                                 DATABASE                                     #
# **************************************************************************** #

migrate:
	@echo "$(BLUE)[$(NAME)] Running database migrations...$(RESET)"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec backend npx prisma migrate dev

init:
	@$(MAKE) up
	@echo "$(BLUE)[$(NAME)] Waiting for database...$(RESET)"
	@sleep 5
	@$(MAKE) migrate

# **************************************************************************** #
#                                 CLEANING                                     #
# **************************************************************************** #

clean:
	@echo "$(RED)[$(NAME)] Removing containers + volumes...$(RESET)"
	@$(COMPOSE) -f $(COMPOSE_FILE) down -v --remove-orphans
	@echo "$(GREEN)[$(NAME)] Clean done$(RESET)"

fclean:
	@echo "$(RED)[WARNING] This will REMOVE all Docker images, volumes, and networks.$(RESET)"
	@printf "Type 'y' to confirm: "; \
	read ans; \
	if [ "$$ans" = "y" ]; then \
		echo "$(PURPLE)[$(NAME)] Full cleanup...$(RESET)"; \
		$(COMPOSE) -f $(COMPOSE_FILE) down -v --remove-orphans; \
		docker system prune -af --volumes; \
		echo "$(GREEN)[$(NAME)] Full cleanup complete$(RESET)"; \
	else \
		echo "$(YELLOW)[$(NAME)] fclean aborted$(RESET)"; \
	fi

re: fclean all

# **************************************************************************** #
#                                 EXTRA                                        #
# **************************************************************************** #

prune:
	@echo "$(RED)[$(NAME)] Pruning unused Docker resources...$(RESET)"
	@docker system prune -f
