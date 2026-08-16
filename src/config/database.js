const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: env.nodeEnv === 'development' ? console.log : false,
  dialectOptions: env.db.ssl ? {
    ssl: {
      require: true,
      rejectUnauthorized: false, // For self-signed certificates (common in hosting like Render)
    },
  } : {},
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true, // snake_case column names
  },
});

module.exports = sequelize;
