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

executeQuery('SELECT 1 AS test')
  .then(r => console.log(JSON.stringify(r, null, 2)))
  .catch(e => console.error('Error:', e.message));
