const API_URL = 'https://momaexcursiones.co/api/sql.php';
const SECRET_KEY = 'moma_db_access_2024_secure_key';

async function executeQuery(query) {
  const url = `${API_URL}?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': SECRET_KEY
    }
  });

  return response.json();
}

async function debug() {
  console.log('=== DEBUG: Tablas ===');
  const tables = await executeQuery('SHOW TABLES');
  console.log(JSON.stringify(tables, null, 2));
  
  console.log('\n=== ¿Existe User? ===');
  const userExists = await executeQuery('SELECT COUNT(*) as cnt FROM User');
  console.log(JSON.stringify(userExists, null, 2));
  
  console.log('\n=== ¿Existe users? ===');
  const usersExists = await executeQuery('SELECT COUNT(*) as cnt FROM users');
  console.log(JSON.stringify(usersExists, null, 2));
  
  console.log('\n=== Estructura de User ===');
  const descUser = await executeQuery('DESCRIBE User');
  console.log(JSON.stringify(descUser, null, 2));
}

debug().then().catch(console.error);
