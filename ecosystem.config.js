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
    // ВАЖНО — теперь без repo:
    repo: 'https://github.com/chicken-curry-1337/glowing-doodle',
    // И без ref:
    ref: DEPLOY_REF,

    // Ничего не создаём, мы уже знаем путь:
    path: DEPLOY_PATH,

    // Кидаем .env на сервер (ты уже видел что это работает)
    'pre-deploy': `scp ./backend/.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/.env`,

    // Готовим всё уже на сервере
    'post-deploy': [
      // backend зависимостИ
      `cd ${DEPLOY_PATH}/backend && npm ci`,

      // frontend билд
      `cd ${DEPLOY_PATH}/frontend && npm ci && npm run build`,

      // перезапуск бэка
      `pm2 restart ecosystem.config.js --only glowing-backend --env production`
    ].join(' && '),
  },
},
};
