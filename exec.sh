npx sequelize db:migrate --env production
npx sequelize-cli db:seed:all --env production
NODE_ENV=production node .