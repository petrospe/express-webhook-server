# Custom Webhook Response Server (Node.js/Express)

This is a simple server built with Node.js and Express that acts as a mock webhook receiver. Its primary function is to **always return an HTTP 200 OK status** along with a **custom JSON payload**, allowing you to test webhook integration systems that require a specific success or error response structure.

The response payload is dynamically determined by a query parameter (`?type=s` or `?type=e`).

## ✨ Features

  * **HTTP 200 Success:** Always returns a `200 OK` status, simulating successful receipt by the endpoint.
  * **Custom JSON Body (SAP OData-style):** Returns an OData-ish response envelope shaped like:
    ```json
    {
      "d": {
        "__metadata": {
          "id": "http://localhost:3002/sap/opu/odata/sap/ZLOCAL_SRV/z_conf_creaSet(uuid='...',event_id=...)",
          "uri": "http://localhost:3002/sap/opu/odata/sap/ZLOCAL_SRV/z_conf_creaSet(uuid='...',event_id=...)",
          "type": "ZLOCAL_SRV.z_conf_crea"
        },
        "uuid": "...",
        "event_id": 3,
        "type": "S" or "E",
        "detail_message": "..."
      }
    }
    ```
    Notes:
    - The server **echoes back** the incoming JSON body fields under `d` and adds standard fields like `uuid`, `event_id`, `type`, `detail_message`.
    - If the request body does not include `uuid`, the server generates one automatically.
  * **Single Endpoint:** Uses one clean endpoint (`/webhook`) controlled by a query parameter.
  * **Debugging + Monitor:** Logs the incoming request body and outgoing JSON response to the console, and exposes a simple HTML dashboard at `/monitor`.
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
Monitoring URL: http://localhost:3002/monitor
```

## 🧪 How to Test the Endpoint

Since the server requires a **POST** request with a JSON body, you must use a client like **cURL**, **Postman**, or **Insomnia** to test it.

### 1\. Test SUCCESS Response (`d.type: "S"`)

This command simulates a webhook sender hitting your server and expecting a success payload.

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"event_id": 100, "user_id": 5}' \
  http://localhost:3002/webhook?type=s
```

**Expected response shape:**

```json
{
  "d": {
    "__metadata": {
      "id": "http://localhost:3002/sap/opu/odata/sap/ZLOCAL_SRV/z_conf_creaSet(uuid='...',event_id=100)",
      "uri": "http://localhost:3002/sap/opu/odata/sap/ZLOCAL_SRV/z_conf_creaSet(uuid='...',event_id=100)",
      "type": "ZLOCAL_SRV.z_conf_crea"
    },
    "event_id": 100,
    "user_id": 5,
    "type": "S",
    "detail_message": "S: Operation was processed correctly. Received event_id: 100",
    "uuid": "..."
  }
}
```

### 2\. Test ERROR Response (`d.type: "E"`)

This command simulates the error path by using the appropriate query parameter.

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"workorder_id": "7", "rework_time": 3551906}' \
  http://localhost:3002/webhook?type=e
```

**Expected response shape:**

```json
{
  "d": {
    "__metadata": {
      "id": "http://localhost:3002/sap/opu/odata/sap/ZLOCAL_SRV/z_conf_creaSet(uuid='...',event_id=0)",
      "uri": "http://localhost:3002/sap/opu/odata/sap/ZLOCAL_SRV/z_conf_creaSet(uuid='...',event_id=0)",
      "type": "ZLOCAL_SRV.z_conf_crea"
    },
    "workorder_id": "7",
    "rework_time": 3551906,
    "type": "E",
    "detail_message": "E RU 024 Preceding operation 0010 of sequence 0 not yet confirmed. Received payload for workorder_id: 7",
    "uuid": "...",
    "event_id": 0
  }
}
```

## ⚙️ Configuration (Environment Variables)

You can customize the values used to build `d.__metadata` without changing code:

- `ODATA_BASE_URL` (default: `http://localhost:3002`)
- `ODATA_SERVICE_PATH` (default: `/sap/opu/odata/sap/ZLOCAL_SRV`)
- `ODATA_ENTITY_SET` (default: `z_conf_creaSet`)
- `ODATA_ENTITY_TYPE` (default: `ZLOCAL_SRV.z_conf_crea`)

## 💻 `server.js` Summary

The core logic for handling the request and generating the response is in the `app.post('/webhook', ...)` handler:

```javascript
// Example logic in server.js
app.post('/webhook', (req, res) => {
    // Determine OData-ish JSON payload based on req.query.type
    // ...
    // Log incoming and outgoing data
    console.log('Incoming Payload:', req.body);
    console.log('Outgoing Response:', jsonResponse);
    
    // Send the custom 200 OK JSON response
    res.status(200).json(jsonResponse); 
});
```