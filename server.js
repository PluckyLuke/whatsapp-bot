const express = require('express');
const axios = require('axios');

const app = express();

const VERIFY_TOKEN = "my_verify_token";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.use(express.json());

// ✅ VERIFY
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
});

// ✅ RECEIVE + REPLY
app.post('/webhook', async (req, res) => {
    try {
        const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        const from = msg?.from;

        if (!from) return res.sendStatus(200);

        await axios.post(
            `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: from,
                type: "template",
                template: {
                    name: "hello_world",
                    language: { code: "en_US" }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.sendStatus(200);

    } catch (err) {
        console.log(err.response?.data || err.message);
        res.sendStatus(200);
    }
});

app.get('/', (req, res) => {
    res.send("Bot running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
