const path = require('path');
require('dotenv').config();

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REF = 'origin/master',
} = process.env;

// Хелпер: включаем nvm и выбираем нужный Node
const NVM_INIT = 'export NVM_DIR=\"$HOME/.nvm\"; . \"$NVM_DIR/nvm.sh\"; nvm use 22';

module.exports = {
  apps: [
    {
      name: 'mesto-backend',
      cwd: path.join(__dirname, 'backend'),
      script: 'npm',
      args: 'run start',
      env: { NODE_ENV: 'production' },
    },
  ],

  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      repo: 'https://github.com/chicken-curry-1337/glowing-doodle',
      ref: DEPLOY_REF,
      path: DEPLOY_PATH,

      'post-setup': `mkdir -p ${DEPLOY_PATH}/shared/backend ${DEPLOY_PATH}/shared/frontend && bash -lc '${NVM_INIT}; npm i -g pm2'`,

      'pre-deploy-local': [
        `scp ./backend/.env  ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/backend/.env`,
        `scp ./frontend/.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/frontend/.env`
      ].join(' && '),

      'post-deploy': [
        // линк .env
        `ln -sf ${DEPLOY_PATH}/shared/backend/.env  ${DEPLOY_PATH}/current/backend/.env`,
        `ln -sf ${DEPLOY_PATH}/shared/frontend/.env ${DEPLOY_PATH}/current/frontend/.env`,

        // backend deps (+ build)
        `bash -lc '${NVM_INIT}; cd ${DEPLOY_PATH}/current/backend && npm ci && npm run build || true'`,

        // frontend deps + build
        `bash -lc '${NVM_INIT}; cd ${DEPLOY_PATH}/current/frontend && npm ci && npm run build'`,

        // рестарт только бэка (pm2 после nvm init)
        `bash -lc '${NVM_INIT}; pm2 startOrRestart ${DEPLOY_PATH}/current/ecosystem.config.js --only mesto-backend --env production'`,
      ].join(' && '),
    },
  },
};
