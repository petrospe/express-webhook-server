# Custom Webhook Response Server (Node.js/Express)

This is a simple server built with Node.js and Express that acts as a mock webhook receiver. Its primary function is to **always return an HTTP 200 OK status** along with a **custom JSON payload**, allowing you to test webhook integration systems that require a specific success or error response structure.

The response payload is dynamically determined by a query parameter (`?type=s` or `?type=e`).

## ✨ Features

  * **HTTP 200 Success:** Always returns a `200 OK` status, simulating successful receipt by the endpoint.
  * **Custom JSON Body:** Returns a structured JSON object:
    ```json
    {
      "TYPE": "S" or "E",
      "MESSAGE": "...",
      "MESSAGE_DET": "..."
    }
    ```
  * **Single Endpoint:** Uses one clean endpoint (`/webhook`) controlled by a query parameter.
  * **Debugging:** Logs the incoming request body and the exact outgoing JSON response to the console.
  * **Port:** Runs on `http://localhost:3002`.

## 🛠️ Setup and Installation

### Prerequisites

You must have [Node.js](https://nodejs.org/) installed on your system.

### Steps

1.  **Clone or create the project folder:**

    ```bash
    mkdir express-webhook-server
    cd express-webhook-server
    ```

2.  **Initialize Node.js and install dependencies:**

    ```bash
    npm init -y
    npm install express
    ```

3.  **Ensure `server.js` is in the directory:**
    Verify that your `server.js` file (configured to listen on port 3002) is present in the project root.

## ▶️ How to Run the Server

Start the application from your terminal:

```bash
node server.js
```

The console will confirm the server is running:

```
Webhook server listening on http://localhost:3002
Test URL (Success): http://localhost:3002/webhook?type=s
Test URL (Error): http://localhost:3002/webhook?type=e
```

## 🧪 How to Test the Endpoint

Since the server requires a **POST** request with a JSON body, you must use a client like **cURL**, **Postman**, or **Insomnia** to test it.

### 1\. Test SUCCESS Response (`TYPE:S`)

This command simulates a webhook sender hitting your server and expecting a success payload.

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"event_id": 100, "user_id": 5}' \
  http://localhost:3002/webhook?type=s
```

**Expected Console Output (server terminal):**

```
----------------------------------------------------
Incoming Payload: { event_id: 100, user_id: 5 }
Outgoing Response (Status 200): {
  TYPE: 'S',
  MESSAGE: 'SUCCESS: The work order event was processed correctly.',
  MESSAGE_DET: 'Received event_id: 100'
}
----------------------------------------------------
```

### 2\. Test ERROR Response (`TYPE:E`)

This command simulates the error path by using the appropriate query parameter.

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"workorder_id": "7", "rework_time": 3551906}' \
  http://localhost:3002/webhook?type=e
```

**Expected Console Output (server terminal):**

```
----------------------------------------------------
Incoming Payload: { workorder_id: '7', rework_time: 3551906 }
Outgoing Response (Status 200): {
  TYPE: 'E',
  MESSAGE: 'ERROR: A required field was missing or invalid.',
  MESSAGE_DET: 'Received payload for workorder_id: 7'
}
----------------------------------------------------
```

## 💻 `server.js` Summary

The core logic for handling the request and generating the response is in the `app.post('/webhook', ...)` handler:

```javascript
// Example logic in server.js
app.post('/webhook', (req, res) => {
    // Determine JSON payload based on req.query.type
    // ...
    // Log incoming and outgoing data
    console.log('Incoming Payload:', req.body);
    console.log('Outgoing Response:', jsonResponse);
    
    // Send the custom 200 OK JSON response
    res.status(200).json(jsonResponse); 
});
```