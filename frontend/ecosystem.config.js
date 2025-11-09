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
      'pre-deploy': `scp ./.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/frontend/.env`,

      // Готовим всё уже на сервере
      'post-deploy': [
        `cd ${DEPLOY_PATH}/frontend && npm ci && npm run build`,
      ].join(' && '),
    },
},
};
