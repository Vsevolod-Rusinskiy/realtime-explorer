- ✅ Done: 50%
- 🚀 In progress: 40%
- ⏳ Not started: 10%

# Realtime-explorer deployment plan

---

## Progress

- As you complete the steps, mark them with checkmarks (✅) and update the percentages at the top of the file.

---

## Deployment and testing stages

### 1. Server preparation
  1.1. ✅ Open the necessary ports for the application and DB (leave standard ports)
  1.2. ✅ Install nvm, Node.js 20.9.0, Docker, docker-compose (if not already installed)
  1.3. ✅ Create the folder `/var/www/realtime-explorer/` on the server
  1.4. ⏳ Create a separate user for deployment (e.g., admin or deployer), add them to the sudo and docker groups, set up SSH keys

### 2. Cloning and preparing the project
  2.1. ✅ Clone the repository into `/var/www/realtime-explorer/`
  2.2. ✅ Go to the project folder
  2.3. ✅ Install dependencies for each service (e.g., `cd squid && npm install`)
  2.4. ✅ Check and configure all necessary .env variables and secrets (DB, API keys, passwords)
  2.5. Do not store secrets and .env in git! Use .env and CI/CD secrets
  2.6. ✅ After installing dependencies, be sure to run:
    - `npx squid-typeorm-codegen`
    - `npm run build`
    - `npx squid-typeorm-migration apply`
  2.7. ✅ Migrations are successfully applied manually

### 3. Creating and configuring deploy.sh
  3.1. ⏳ In the project root, create a `deploy.sh` file with logic:
    - source ~/.nvm/nvm.sh && nvm use 20.9.0
    - git pull origin main
    - docker-compose pull && docker-compose build
    - run migrations via docker-compose (separate command)
    - start all services via docker-compose up -d
    - build and codegen for squid are now also automated in deploy.sh
  3.2. ⏳ Make the script executable: `chmod +x deploy.sh`

### 4. Creating a test migration
  4.1. ⏳ Make a test migration (e.g., add/remove a field in the account table)
  4.2. ⏳ Generate and apply the migration locally, make sure it works
  4.3. ⏳ Push the migration to the repository

### 5. Manual deployment check
  5.1. ⏳ Connect to the server via SSH (root)
  5.2. ⏳ Go to `/var/www/realtime-explorer/`
  5.3. ⏳ Run `./deploy.sh`
  5.4. ⏳ Check that migrations have been applied, services have started, logs are correct

### 6. Result check
  6.1. ⏳ Check that the new field appeared in the DB (psql, Hasura, pgAdmin)
  6.2. ⏳ Check the availability of services on standard ports

### 7. SSL setup
  7.1. ⏳ Set up SSL for the application (e.g., via nginx + certbot)
  7.2. ⏳ Check the availability of the application via https

### 8. CI/CD integration
  8.1. ⏳ After successful manual check — add deploy.sh call to the CI/CD workflow
  8.2. ⏳ Set up secrets and environment variables for CI/CD
  8.3. ⏳ Check automatic deployment with migration application (e.g., remove a field from the table and make sure it disappears after deployment)

---

**Notes:**
- The deploy.sh script can be run manually on the server for quick checks, without running CI/CD.
- Before starting, make sure all environment variables and docker-compose.yml are set to standard ports.
- Don't forget about .env and secrets — don't store them in git!
- As you complete the steps, update the progress at the top of the file. 