import express from 'express';
import fetch from 'node-fetch';
import Cors from 'micro-cors';

const cors = Cors({
  allowedMethods: ['POST', 'OPTIONS'],
});

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  const leadData = req.body;
  const url = 'https://www.zohoapis.eu/crm/v2/Leads';

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ data: [leadData] }),
      headers: {
        Authorization: `Bearer ${process.env.ZOHO_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const zohoResponse = await response.json();

    if (!zohoResponse.data || !zohoResponse.data[0].details || !zohoResponse.data[0].details.id) {
      console.error('Failed to create lead in Zoho CRM: ', zohoResponse);
      return res.status(500).json({ success: false });
    }

    console.log('Created lead in Zoho CRM: ', zohoResponse.data[0].details.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error while creating lead in Zoho CRM: ', error);
    res.status(500).json({ success: false });
  }
};

export default cors(handler);
