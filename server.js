const express = require('express');
const app = express();
const port = 3002;

// Variable to store the last incoming payload and the corresponding outgoing response
let lastWebhookData = {
    incoming: 'No webhook received yet.',
    outgoing: 'N/A'
};

// --- Configure Express ---
// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 1. WEBHOOK ENDPOINT (POST) ---
app.post('/webhook', (req, res) => {
    const responseType = req.query.type;
    
    let jsonResponse = {
        TYPE: "U", 
        MESSAGE: "Invalid or missing 'type' parameter.",
        MESSAGE_DET: "The webhook response type must be specified with ?type=s or ?type=e."
    };

    if (responseType === 's') {
        jsonResponse = {
            TYPE: "S",
            MESSAGE: "SUCCESS: The work order event was processed correctly.",
            MESSAGE_DET: `Received event_id: ${req.body.event_id || 'N/A'}`
        };
    } else if (responseType === 'e') {
        jsonResponse = {
            TYPE: "E",
            MESSAGE: "ERROR: A required field was missing or invalid.",
            MESSAGE_DET: `Received payload for workorder_id: ${req.body.workorder_id || 'N/A'}`
        };
    }

    // --- CRITICAL CHANGE: Update the global state variable ---
    lastWebhookData.incoming = req.body;
    lastWebhookData.outgoing = jsonResponse;

    // Log to console (as before)
    console.log('----------------------------------------------------');
    console.log('Incoming Payload:', lastWebhookData.incoming);
    console.log('Outgoing Response (Status 200):', lastWebhookData.outgoing);
    console.log('----------------------------------------------------');
    
    // Send the custom 200 OK JSON response
    res.status(200).json(jsonResponse);
});


// --- 2. MONITORING DASHBOARD (GET) ---
app.get('/monitor', (req, res) => {
    // Helper function to safely stringify and format JSON
    const formatJson = (data) => {
        try {
            return JSON.stringify(data, null, 2);
        } catch (e) {
            return String(data);
        }
    };

    // Render the data directly into a simple HTML string
    const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Webhook Monitor (3002)</title>
            <meta http-equiv="refresh" content="5"> <style>
                body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f9; }
                .container { max-width: 900px; margin: auto; }
                h1, h2 { color: #333; }
                .log-box { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                pre { background-color: #eee; padding: 15px; border: 1px dashed #aaa; overflow-x: auto; white-space: pre-wrap; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Webhook Monitoring Dashboard (Port 3002)</h1>
                <p>The page automatically refreshes every 5 seconds. To test, send a POST request to <code>http://localhost:3002/webhook?type=s</code> or <code>?type=e</code>.</p>
                <hr>

                <div class="log-box">
                    <h2>🕒 Last Incoming Payload (Request Body)</h2>
                    <pre>${formatJson(lastWebhookData.incoming)}</pre>
                </div>

                <div class="log-box">
                    <h2>✅ Outgoing Response (Status 200 JSON)</h2>
                    <pre>${formatJson(lastWebhookData.outgoing)}</pre>
                </div>
                
                <p>Last updated: ${new Date().toLocaleTimeString()}</p>
            </div>
        </body>
        </html>
    `;
    
    res.send(htmlResponse);
});


// Start the server
app.listen(port, () => {
    console.log(`Webhook server listening on http://localhost:${port}`);
    console.log(`Monitoring URL: http://localhost:${port}/monitor`); // <-- NEW MONITOR URL
});