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

      // Кидаем .env на сервер
      'pre-deploy-local': [
        `scp ./frontend/.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/frontend/.env`,
        `scp ./backend/.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/.env`
      ].join(' && '),

      // Готовим всё уже на сервере
      'pre-deploy': [
        // frontend зависимости
        `cd ${DEPLOY_PATH}/frontend && npm ci`,
        // backend зависимостИ
        `cd ${DEPLOY_PATH}/backend && npm ci`,

        // перезапуск бэка
        `pm2 restart ecosystem.config.js --only glowing-backend --env production`
      ].join(' && '),
      'pre-deploy': `pm2 restart ecosystem.config.js --only mesto-backend --env production`,
    },
},
};
