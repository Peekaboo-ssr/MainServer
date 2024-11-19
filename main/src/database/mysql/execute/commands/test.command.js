import DatabaseManager from '../../../../classes/managers/databaseManager.js';

export const testDBConnection = async (pool, dbName) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log(`${dbName} 테스트 쿼리 결과:`, rows[0].solution);
  } catch (error) {
    console.error(`${dbName} 테스트 쿼리 실행 중 오류 발생`, error);
  }
};

export const testAllDBConnection = () => {
  testDBConnection(DatabaseManager.pools.USER_DB, 'PEEKABOO_USER_DB');
  testDBConnection(DatabaseManager.pools.GAME_DB, 'PEEKABOO_GAME_DB');
};