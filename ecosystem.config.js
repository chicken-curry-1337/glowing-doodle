const path = require('path');
require('dotenv').config();

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REF = 'origin/master',
} = process.env;

const HOME = '/home/fin';
const NVM_BIN = `${HOME}/.nvm/versions/node/v22.21.1/bin`; // абсолютный путь

module.exports = {
  apps: [
    {
      name: 'mesto-backend',
      cwd: path.join(__dirname, 'backend'),
      script: `${NVM_BIN}/npm`,   // запускаем npm по абсолютному пути
      args: 'run start',
      env: { NODE_ENV: 'production' }, // НЕ трогаем PATH вообще
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
        `scp ./frontend/.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/frontend/.env`
      ].join(' && '),

      'post-deploy': [
        // линк .env
        `ln -sf ${DEPLOY_PATH}/shared/backend/.env  ${DEPLOY_PATH}/current/backend/.env`,
        `ln -sf ${DEPLOY_PATH}/shared/frontend/.env ${DEPLOY_PATH}/current/frontend/.env`,

        // backend deps (+опц. build)
        `cd ${DEPLOY_PATH}/current/backend && ${NVM_BIN}/npm ci`,
        `cd ${DEPLOY_PATH}/current/backend && ${NVM_BIN}/npm run build || true`,

        // frontend deps + build (если нужно)
        `cd ${DEPLOY_PATH}/current/frontend && ${NVM_BIN}/npm ci`,
        `cd ${DEPLOY_PATH}/current/frontend && ${NVM_BIN}/npm run build`,

        // рестарт только бэка (pm2 тоже по абсолютному пути)
        `${NVM_BIN}/pm2 startOrRestart ${DEPLOY_PATH}/current/ecosystem.config.js --only mesto-backend --env production`
      ].join(' && '),
    },
  },
};
