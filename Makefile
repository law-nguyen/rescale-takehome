.PHONY: build up test stop clean

# Builds all Docker images
build:
	docker compose build

# Starts the entire application stack
up:
	docker compose up
	open http://localhost:5173

# Runs Playwright E2E tests
# Assumes the app is already running (make up first)
test:
	cd frontend && npx playwright test

# Stops all running containers
stop:
	docker compose stop

# Removes containers, volumes, and networks for a clean slate
clean:
	docker compose down -v --remove-orphans
