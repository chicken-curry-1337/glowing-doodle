const path = require('path');
require('dotenv').config();

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REF = 'origin/master',
} = process.env;

const NVM_NODE = '~/.nvm/versions/node/v22.21.1/bin';
const NVM_PATH = `${NVM_NODE}:$PATH`;

module.exports = {
  apps: [
    {
      name: 'mesto-backend',
      cwd: path.join(__dirname, 'backend'),
      script: 'npm',
      args: 'run start',           // старт из package.json backend
      env: {
        NODE_ENV: 'production',
        PATH: NVM_PATH,            // чтобы pm2-демон видел правильный node/npm
      },
    },
  ],

  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      repo: 'https://github.com/chicken-curry-1337/glowing-doodle',
      ref: DEPLOY_REF,
      path: DEPLOY_PATH,

      // создадим shared папки
      'post-setup': [
        `mkdir -p ${DEPLOY_PATH}/shared/backend ${DEPLOY_PATH}/shared/frontend`
      ].join(' && '),

      // копируем .env локально → в shared на сервере
      'pre-deploy-local': [
        `scp ./backend/.env  ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/backend/.env`,
        `scp ./frontend/.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/frontend/.env`
      ].join(' && '),

      // на сервере: линкуем .env, ставим зависимости, билдим, рестартим бэкенд
      'post-deploy': [
        // линки env
        `ln -sf ${DEPLOY_PATH}/shared/backend/.env  ${DEPLOY_PATH}/current/backend/.env`,
        `ln -sf ${DEPLOY_PATH}/shared/frontend/.env ${DEPLOY_PATH}/current/frontend/.env`,

        // установить корневые тулзы, если нужны (опционально)
        `cd ${DEPLOY_PATH}/current && export PATH=${NVM_PATH} && npm ci || true`,

        // backend: deps + build
        `cd ${DEPLOY_PATH}/current/backend && export PATH=${NVM_PATH} && npm ci`,
        `cd ${DEPLOY_PATH}/current/backend && export PATH=${NVM_PATH} && npm run build || true`,

        // frontend: deps + build (одноразово)
        `cd ${DEPLOY_PATH}/current/frontend && export PATH=${NVM_PATH} && npm ci`,
        `cd ${DEPLOY_PATH}/current/frontend && export PATH=${NVM_PATH} && npm run build`,

        // рестартим только бэкенд
        `cd ${DEPLOY_PATH}/current && pm2 startOrRestart ecosystem.config.js --only mesto-backend --env production`,
      ].join(' && '),
    },
  },
};
