const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: false,
  dialectOptions: env.db.ssl ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    keepAlive: true,
  } : {},
  pool: {
    max: 25,
    min: 0,
    acquire: 30000,
    idle: 5000,
    evict: 1000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;
