async function run() {
  console.log('Sending login request to api-gateway for MANAGER...');
  try {
    const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'rajesh.kumar',
        password: 'Manager@123'
      })
    });

    if (!loginRes.ok) {
      const data = await loginRes.json();
      console.error('Login failed with status:', loginRes.status, data);
      return;
    }

    const setCookie = loginRes.headers.get('set-cookie');
    let jwtCookie = '';
    if (setCookie) {
      const match = setCookie.match(/jwt=([^;]+)/);
      if (match) {
        jwtCookie = `jwt=${match[1]}`;
      }
    }

    // Now request /categories
    console.log('Requesting GET /api/v1/categories...');
    const catRes = await fetch('http://localhost:3000/api/v1/categories', {
      headers: {
        'Cookie': jwtCookie
      }
    });

    console.log('Status:', catRes.status);
    const data = await catRes.json();
    console.log('Data:', JSON.stringify(data, null, 2));

  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

run().catch(console.error);
