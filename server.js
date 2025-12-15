const express = require('express');
const app = express();
const port = 3002;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Webhook Endpoint: Handles both TYPE:e and TYPE:s ---
app.post('/webhook', (req, res) => {
    // 1. Get the 'type' query parameter (e.g., ?type=e or ?type=s)
    const responseType = req.query.type;
    
    // Define the base JSON response object
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

    // 2. Log the incoming payload and the outgoing response body
    console.log('----------------------------------------------------');
    console.log('Incoming Payload:', req.body);
    console.log('Outgoing Response (Status 200):', jsonResponse); // <-- CRITICAL CHANGE HERE
    console.log('----------------------------------------------------');
    
    // 3. Set the HTTP Status Code to 200 (OK) and send the custom JSON response
    res.status(200).json(jsonResponse);
});

// Start the server
app.listen(port, () => {
    console.log(`Webhook server listening on http://localhost:${port}`);
    console.log(`Test URL (Success): http://localhost:${port}/webhook?type=s`);
    console.log(`Test URL (Error): http://localhost:${port}/webhook?type=e`);
});