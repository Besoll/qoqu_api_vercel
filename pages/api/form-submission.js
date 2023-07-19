const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { name, email, phonenumber, message } = req.body;

    if (!name || !email || !phonenumber || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const accessToken = await getAccessToken();

    const leadData = {
      data: [{
        Last_Name: name,
        Email: email,
        Phone: phonenumber,
        Description: message
      }]
    };

    const response = await fetch('https://www.zohoapis.eu/crm/v2/Leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-oauthtoken ${accessToken}`
      },
      body: JSON.stringify(leadData)
    });

    const zohoResponse = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: `Failed to create lead in Zoho CRM: ${zohoResponse.error}` });
    }

    res.status(200).json({ success: true });
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

async function getAccessToken() {
  const response = await fetch('https://accounts.zoho.eu/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      'refresh_token': process.env.REFRESH_TOKEN,
      'client_id': process.env.CLIENT_ID,
      'client_secret': process.env.CLIENT_SECRET,
      'grant_type': 'refresh_token'
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to refresh access token: ${data.error}`);
  }

  return data.access_token;
}

function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
