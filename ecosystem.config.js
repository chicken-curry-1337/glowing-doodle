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
      ref: DEPLOY_REF,
      repo: 'https://github.com/chicken-curry-1337/glowing-doodle.git',
      path: DEPLOY_PATH,

      // как в статье — кидаем .env перед деплоем
      'pre-deploy-local': `scp ./backend/.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}`,

      // на сервере:
      'post-deploy': [
        // установить зависимости бэка
        'cd backend && npm ci',

        // установить зависимости фронта + билд
        'cd ../frontend && npm ci && npm run build',

        // и тупо переложить билд туда, где его раздает nginx
        'rm -rf /home/fin/glowing-doodle/frontend/build',
        'cp -R ./build /home/fin/glowing-doodle/frontend/build',

        // перезапуск бэка
        'pm2 restart ecosystem.config.js --only glowing-backend --env production'
      ].join(' && '),
    },
  },
};
