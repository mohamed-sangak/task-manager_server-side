import { sequelize } from './config';
import mysql from 'mysql2/promise';

export async function DBconnect() {
  try {
    // Ensure the database itself exists ,Requires the DB user to have CREATE DATABASE privileges.
    const host = process.env.DB_HOST || 'localhost';
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || 'password';
    const database = process.env.DB_NAME || 'task_management_db';

    try {
      const conn = await mysql.createConnection({ host, port, user, password });
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await conn.end();
      console.log(`Ensured database exists: ${database}`);
    } catch (dbErr) {
      console.warn('Could not create database automatically — proceeding and expecting the database to exist.', dbErr);
    }

    await sequelize.authenticate();
    console.log('Connected to MySQL Database.');

    // Sync models according to DB_SYNC setting
    // Default to 'none' to avoid making schema changes at runtime.
    // Use migrations for schema management. Set DB_SYNC explicitly to 'alter' or 'force' when intentionally needed.
    const syncMode = process.env.DB_SYNC ?? 'none';

    if (syncMode === 'force') {
      console.warn('DB_SYNC=force — this will DROP and re-create tables. Use with extreme caution.');
      await sequelize.sync({ force: true });
      console.log('All tables and indexes synced (force).');
    } else if (syncMode === 'alter') {
      console.warn('DB_SYNC=alter — syncing models with ALTER. Prefer migrations for production.');
      await sequelize.sync({ alter: true });
      console.log('All tables and indexes synced (alter).');
    } else if (syncMode === 'sync') {
      console.warn('DB_SYNC=sync — syncing models with default sync(). Prefer migrations.');
      await sequelize.sync();
      console.log('All tables and indexes synced.');
    } else {
      console.log('Skipping model synchronization (DB_SYNC is "none"). Use migrations to manage schema changes.');
    }

    console.log('Database ready.');
  } catch (error) {
    console.error('❌ Error during database execution:', error);
    throw error;
  }
}

