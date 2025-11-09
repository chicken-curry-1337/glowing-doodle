const path = require('path');
require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'mesto-backend',
      cwd: `${__dirname}/backend`,
      script: 'npm',
      args: 'run start',
      env: { NODE_ENV: 'production' }
    },
    // build фронта не нужно держать в PM2-процессе — он статичен
    // лучше собирать в post-deploy и раздавать nginx-ом
  ],

  deploy: {
    production: {
      user: process.env.DEPLOY_USER,
      host: process.env.DEPLOY_HOST,
      repo: 'https://github.com/chicken-curry-1337/glowing-doodle',
      ref: process.env.DEPLOY_REF || 'origin/master',
      path: process.env.DEPLOY_PATH,

      'post-setup': 'mkdir -p $DEPLOY_PATH/shared/backend $DEPLOY_PATH/shared/frontend',

      // копируем env-ки в shared
      'pre-deploy-local': [
        'scp ./backend/.env $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/shared/backend/.env',
        'scp ./frontend/.env $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/shared/frontend/.env'
      ].join(' && '),

      // раскатываем, линкуем env, ставим зависимости, билдим фронт, рестартим бэк
      'post-deploy': [
        'ln -sf $DEPLOY_PATH/shared/backend/.env  $DEPLOY_PATH/current/backend/.env',
        'ln -sf $DEPLOY_PATH/shared/frontend/.env $DEPLOY_PATH/current/frontend/.env',

        // корень (на случай корневых скриптов)
        'cd $DEPLOY_PATH/current && source ~/.nvm/nvm.sh && nvm use v22.21.1 && npm ci || npm i',

        // backend deps
        'cd $DEPLOY_PATH/current/backend && source ~/.nvm/nvm.sh && nvm use v22.21.1 && npm ci || npm i',

        // frontend build (он не в PM2!)
        'cd $DEPLOY_PATH/current/frontend && source ~/.nvm/nvm.sh && nvm use v22.21.1 && npm ci || npm i && npm run build',

        // перезапуск только бэкенда, из правильного ecosystem-а
        'cd $DEPLOY_PATH/current && pm2 delete mesto-backend || true',
        'cd $DEPLOY_PATH/current && pm2 startOrRestart ecosystem.config.js --only mesto-backend --env production'
      ].join(' && ')
    }
  }
};