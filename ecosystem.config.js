const path = require('path');
require('dotenv').config();

const { DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH, DEPLOY_REF = 'origin/master' } = process.env;

// одна строка, которую будем префиксить ко всем командам:
const NVM = 'export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22';

module.exports = {
  apps: [
    {
      name: 'mesto-backend',
      cwd: path.join(__dirname, 'backend'),
      script: 'node',
      args: 'dist/app.js', 
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

      'post-setup': `mkdir -p ${DEPLOY_PATH}/shared/backend ${DEPLOY_PATH}/shared/frontend`,

      'pre-deploy-local': [
        `scp ./backend/.env  ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/backend/.env`,
        `scp ./frontend/.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/frontend/.env`,
      ].join(' && '),

      'post-deploy': [
        // подрубаем nvm один раз и дальше живём
        `${NVM}`,
        // линкуем env
        `ln -sf ${DEPLOY_PATH}/shared/backend/.env  ${DEPLOY_PATH}/current/backend/.env`,
        `ln -sf ${DEPLOY_PATH}/shared/frontend/.env ${DEPLOY_PATH}/current/frontend/.env`,
        // backend: deps + опц. build
        `cd ${DEPLOY_PATH}/current/backend && npm ci`,
        `cd ${DEPLOY_PATH}/current/backend && npm run build || true`,
        // frontend: deps + build
        `cd ${DEPLOY_PATH}/current/frontend && npm ci`,
        `cd ${DEPLOY_PATH}/current/frontend && npm run build`,
        // рестарт только бэка
        `pm2 startOrRestart ${DEPLOY_PATH}/current/ecosystem.config.js --only mesto-backend --env production`,
      ].join(' && '),
    },
  },
};
