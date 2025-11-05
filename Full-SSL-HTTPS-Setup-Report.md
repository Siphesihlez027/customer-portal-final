# Customer Portal – Full SSL / HTTPS Setup Report

> **Project:** Customer Portal  
> **Environment:** Local Development (Windows 10/11)  
> **Technologies:** Node.js (Express), React, MongoDB

---

## 1. Executive Summary

This report details the implementation of full HTTPS (SSL) encryption for both the backend and frontend components of the Customer Portal project.

The goal was to replicate a secure production-like environment in local development, ensuring that all data transmitted between the React frontend and Node.js backend is encrypted. The setup successfully enables HTTPS communication using `mkcert`-generated SSL certificates, with CORS and browser trust properly configured.

All endpoints were tested and verified using Postman over HTTPS, confirming that authentication, employee, and payment routes function securely and without certificate or mixed-content issues.

## 2. Objectives

The primary objectives of this setup were:

- To enable HTTPS on both backend and frontend in a local environment.
- To generate and use trusted SSL certificates with `mkcert`.
- To ensure all traffic between the client and server is encrypted.
- To verify SSL behavior using Postman and browser-based testing.
- To configure CORS properly for secure cross-origin communication.

This setup allows developers to test SSL-dependent features such as cookies, CORS, and API requests without browser errors.

## 3. Tools and Dependencies

### Node.js and npm

Node.js serves as the runtime environment for both the backend and frontend. Installation was verified with the commands:

```bash
node -v
npm -v
```

If not installed, Node.js was downloaded from [https://nodejs.org/](https://nodejs.org/) (LTS version recommended).

### Chocolatey (Windows Package Manager)

Chocolatey simplifies the installation of `mkcert` and other developer tools. Installed via PowerShell (Run as Administrator):

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; `
[System.Net.ServicePointManager]::SecurityProtocol = `
[System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Installation verified using:

```bash
choco -v
```

### mkcert (Local Certificate Generator)

`mkcert` generates trusted local SSL certificates. Installed via Chocolatey:

```bash
choco install mkcert -y
mkcert -install
```

The `mkcert -install` command created a local Certificate Authority (CA) and installed it into the system’s trusted root store. Certificates were then generated for `localhost` by navigating to the `backend` directory and running:

```bash
mkcert localhost 127.0.0.1 ::1
```

This produced two files:
- `localhost+2.pem` – SSL certificate
- `localhost+2-key.pem` – SSL private key

## 4. Implementation

### Backend (Express + HTTPS)

The backend was configured to serve over HTTPS using Node’s native `https` module.

1.  **Dependencies installed:**
    ```bash
    npm install express mongoose cors dotenv
    ```

2.  **The `server.js` file was updated as follows:**
    ```javascript
    const fs = require('fs');
    const https = require('https');
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    require('dotenv').config();

    const app = express();

    app.use(express.json());
    app.use(cors({ origin: ['https://localhost:3000'], credentials: true }));

    // Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/employee/auth', require('./routes/employeeAuth'));
    app.use('/api/payments', require('./routes/payments'));

    // MongoDB Connection
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('MongoDB connected'))
      .catch(err => console.error('MongoDB connection error:', err));

    // SSL Setup
    const sslOptions = {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem'),
    };

    const PORT = process.env.PORT || 5000;

    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`HTTPS Server running at https://localhost:${PORT}`);
    });
    ```

3.  **The backend server was started using:**
    ```bash
    node server.js
    ```
    Expected console output:
    ```
    MongoDB connected
    HTTPS Server running at https://localhost:5000
    ```

### Frontend (React + HTTPS)

1.  **In the `frontend` directory, a `.env` file was created with the following contents:**
    ```
    HTTPS=true
    SSL_CRT_FILE=../backend/localhost+2.pem
    SSL_KEY_FILE=../backend/localhost+2-key.pem
    PORT=3000
    ```

2.  **All API calls in the frontend were updated to use HTTPS. For example:**
    ```javascript
    const response = await fetch('https://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData),
    });
    ```

3.  **The frontend was started using:**
    ```bash
    npm start
    ```
    Expected console output:
    ```
    Compiled successfully!
    Local: https://localhost:3000
    ```
    The React application now runs securely using the same SSL certificate as the backend.

## 5. Verification and Testing

### Browser Verification

The frontend was accessed at `https://localhost:3000`. The browser displayed a padlock icon, confirming a trusted SSL connection. In the Developer Tools Network tab, all requests were confirmed to use HTTPS.

### Postman Verification

All API endpoints were tested using Postman over HTTPS to confirm SSL functionality. Requests to authentication, employee, and payment routes returned successful 200 responses. Each response verified that the HTTPS configuration, certificate trust, and CORS setup were functioning correctly.

## 6. Troubleshooting Summary

Common issues encountered and resolved during setup included:

-   `NET::ERR_CERT_AUTHORITY_INVALID` – Resolved by running `mkcert -install` again to ensure the certificate was trusted.
-   `Failed to fetch` / CORS errors – Caused by mixed HTTP and HTTPS requests; fixed by ensuring all frontend requests used `https://`.
-   HTTPS server not starting – Resolved by verifying correct certificate paths and using `https.createServer()` instead of `app.listen()`.

## 7. Results

- The backend and frontend both operate securely over HTTPS.
- `mkcert`-generated certificates are trusted locally.
- All network communication between client and server is encrypted.
- CORS configuration allows only requests from `https://localhost:3000`.
- All endpoints tested successfully in Postman and through the browser.

## 8. Future Recommendations

1.  **Production SSL Certificates**
    Use Let’s Encrypt or Cloudflare for production-grade SSL certificates. Deploy the application using a proper domain name (e.g., `api.customerportal.com`).

2.  **Automation**
    Create a script, such as `npm run setup-ssl`, to automate `mkcert` installation and certificate generation for new developers.

3.  **HTTP to HTTPS Redirection**
    Configure automatic redirection from HTTP to HTTPS for consistency and security.

4.  **Enhanced Security Headers**
    Implement the `helmet` middleware in Express to improve HTTP header security.

## 9. Conclusion

The SSL and HTTPS setup for the Customer Portal project was successfully implemented and validated. Both the backend and frontend now communicate securely using `mkcert`-generated certificates over HTTPS.

All endpoints were tested and verified using Postman, confirming secure, encrypted, and fully functional communication across all modules, including authentication, employee management, and payments.

The system now mirrors a production-grade HTTPS setup, ensuring secure data transmission and eliminating mixed-content or CORS-related issues during development.

---

## References

- chocolatey. (2025). *chocolatey*. Retrieved from chocolatey: <https://chocolatey.org/install#individual>
- mkcert. (2024, April 18). *github*. Retrieved from github: <https://github.com/FiloSottile/mkcert>
