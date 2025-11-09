// ecosystem.config.js
require('dotenv').config();

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REF = 'origin/master',
} = process.env;

module.exports = {
  apps: [
    {
      name: 'mesto-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'mesto-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run build',
      env: {
        NODE_ENV: 'production',
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

      'post-setup': `mkdir -p ${DEPLOY_PATH}/shared/backend ${DEPLOY_PATH}/shared/frontend`,

      // 2) локально копируем .env В SHARED
      'pre-deploy-local': [
        `scp ./backend/.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/backend/.env`,
        `scp ./frontend/.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/frontend/.env`
      ].join(' && '),

      // 3) ставим зависимости, линкуем .env, рестартим
      'post-deploy': [
        `ln -sf ${DEPLOY_PATH}/shared/backend/.env ${DEPLOY_PATH}/current/backend/.env`,
        `ln -sf ${DEPLOY_PATH}/shared/frontend/.env ${DEPLOY_PATH}/current/frontend/.env`,
        `cd ${DEPLOY_PATH}/current/backend && npm ci`,
        `pm2 startOrRestart ${DEPLOY_PATH}/current/ecosystem.config.js --only mesto-backend --env production`
      ].join(' && '),
    },
},
};
