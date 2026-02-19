const mysql = require('mysql2/promise');

async function testConnection() {
  const connection = await mysql.createConnection({
    host: '191.108.96.191',
    user: 'momaexcu_admin',
    password: 'u%!(IE[n8^AzMdYZ',
    database: 'momaexcu_web'
  });

  try {
    const [rows] = await connection.execute('SELECT 1 AS test');
    console.log('✅ Conexión exitosa:', rows);

    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tablas:', tables.map(t => Object.values(t)[0]));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testConnection();
