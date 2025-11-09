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
      name: 'glowing-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start',
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
      'pre-deploy': `scp ./.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/.env`,

      // Готовим всё уже на сервере
      'post-deploy': [
        // backend зависимостИ
        `cd ${DEPLOY_PATH}/backend && npm ci`,

        // перезапуск бэка
        `pm2 restart ecosystem.config.js --only glowing-backend --env production`
      ].join(' && '),
    },
},
};
