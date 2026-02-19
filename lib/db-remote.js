const API_URL = 'https://momaexcursiones.co/api/db/query.php';
const SECRET_KEY = 'moma_db_access_2024_secure_key';

async function executeQuery(query, params = []) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': SECRET_KEY
    },
    body: JSON.stringify({ query, params })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error en la query');
  }
  return data;
}

async function testConnection() {
  console.log('🔄 Probando conexión...\n');

  try {
    const result = await executeQuery('SELECT 1 AS test');
    console.log('✅ Conexión exitosa!\n');

    const tablesResult = await executeQuery('SHOW TABLES');
    const tables = tablesResult.data.map(t => Object.values(t)[0]);
    console.log('📋 Tablas en la base de datos:');
    tables.forEach(t => console.log('   - ' + t));

    return tables;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

const query = process.argv[2];
if (query) {
  executeQuery(query).then(r => console.log(JSON.stringify(r, null, 2))).catch(e => console.error(e.message));
} else {
  testConnection();
}

module.exports = { executeQuery };
