import { sequelize } from './config';

export async function DBconnect() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL Database.');

    // Sync models according to environment or DB_SYNC setting
    const syncMode = process.env.DB_SYNC || (process.env.NODE_ENV === 'production' ? 'none' : 'alter');

    if (syncMode === 'force') {
      console.warn(' DB_SYNC=force — this will DROP and re-create tables');
      await sequelize.sync({ force: true });
      console.log(' All tables and indexes synced (force).');
    } else if (syncMode === 'alter') {
      await sequelize.sync({ alter: true });
      console.log(' All tables and indexes synced (alter).');
    } else if (syncMode === 'sync') {
      await sequelize.sync();
      console.log(' All tables and indexes synced.');
    } else {
      console.log(' Skipping model synchronization (DB_SYNC set to "none").');
    }

    console.log('✅ Database ready.');
  } catch (error) {
    console.error('❌ Error during database execution:', error);
    throw error;
  }
}

