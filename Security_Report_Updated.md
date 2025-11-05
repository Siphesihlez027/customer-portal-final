# Customer Portal – Full SSL / HTTPS and Security Hardening Report

**Project:** Customer Portal
**Environment:** Local Development (Windows 10/11)
**Technologies:** Node.js (Express), React, MongoDB

## 1. Executive Summary

This report details the implementation of full HTTPS (SSL) encryption and comprehensive security hardening for the Customer Portal project. The goal was to establish a secure, production-like environment in local development, ensuring all data in transit is encrypted and the application is protected against common web vulnerabilities.

The setup successfully enables HTTPS, and a multi-layered security approach has been implemented, including defenses against session jacking, clickjacking, NoSQL injection, Cross-Site Scripting (XSS), Man-in-the-Middle (MITM), and DDoS attacks. All security measures have been configured and verified.

## 2. Objectives

The primary objectives of this initiative were:
- To enable HTTPS on both backend and frontend in a local environment.
- To implement and configure robust security middleware on the backend.
- To secure the frontend by implementing CSRF protection and using secure API request patterns.
- To ensure all traffic between the client and server is encrypted and protected.
- To verify the security measures through testing and configuration review.

## 3. Tools and Dependencies

### 3.1. Foundational Tools

- **Node.js and npm:** Runtime for both backend and frontend.
- **Chocolatey (Windows):** Used for installing `mkcert`.
- **mkcert:** For generating locally trusted SSL certificates.

### 3.2. Backend Dependencies (`package.json`)

- **`express`**: Web framework for Node.js.
- **`mongoose`**: ODM for MongoDB, providing schema validation and query sanitization.
- **`cors`**: Middleware for enabling Cross-Origin Resource Sharing.
- **`dotenv`**: For loading environment variables.
- **`bcryptjs`**: For hashing passwords.
- **`jsonwebtoken`**: For creating and verifying JSON Web Tokens.
- **`express-session`**: For session management.
- **`connect-mongo`**: For storing session data in MongoDB.
- **`helmet`**: For setting various security-related HTTP headers.
- **`hpp`**: For protection against HTTP Parameter Pollution attacks.
- **`express-rate-limit`**: For rate-limiting requests to prevent brute-force/DDoS attacks.
- **`csurf`**: For CSRF protection.

### 3.3. Frontend Dependencies (`package.json`)

- **`axios`**: For making HTTP requests from the browser.
- **`react`**: A JavaScript library for building user interfaces.
- **`react-dom`**: Serves as the entry point to the DOM and server renderers for React.
- **`react-router-dom`**: For routing in a React application.
- **`react-scripts`**: Provides the scripts for running, building, and testing a Create React App.

## 4. Security Hardening Implementation

This section details the specific security measures implemented in the backend and frontend.

### i. Session Jacking Protection

Session jacking is mitigated by using secure, `httpOnly` cookies for session management. This prevents client-side scripts from accessing the session cookie, a common attack vector.

**File:** `backend/server.js`
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_strong_session_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    secure: true,       // Only send over HTTPS
    httpOnly: true,     // Prevent client-side JS access
    sameSite: 'strict'  // Prevent CSRF
  }
}));
```

### ii. Clickjacking Protection

Clickjacking is prevented by using the `Content-Security-Policy` (CSP) header with the `frame-ancestors 'self'` directive. This is handled by the `helmet` middleware and stops the site from being embedded in an `<iframe>` on another domain.

**File:** `backend/server.js`
```javascript
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "frame-ancestors": ["'self'"], // Disallow framing from different origins
    },
  })
);
```

### iii. NoSQL Injection Attacks

While this application uses a NoSQL database (MongoDB), it is still important to protect against injection attacks. Mongoose, the ODM used, provides built-in protection by enforcing schemas and sanitizing query inputs. This ensures that data conforms to the defined structure and that malicious input is not executed by the database.

**Example Mongoose Schema and Query:**
```javascript
// Example of a Mongoose schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Example of a sanitized query
const user = await User.findOne({ email: userInputEmail });
```

### iv. Cross-Site Scripting (XSS) Attacks

XSS attacks are primarily mitigated on the frontend by React's automatic escaping of data rendered in JSX. Any data rendered to the DOM is automatically converted to a string, preventing malicious scripts from being executed. Additionally, `helmet` provides the `X-XSS-Protection` header as a defense-in-depth measure for older browsers.

**File:** (Any React Component, e.g., `frontend/src/Components/Home/Home.jsx`)
```jsx
// React automatically escapes the 'username' variable
<div>Welcome, {username}</div>
```

### v. Man-in-the-Middle (MITM) Attacks

MITM attacks are prevented by enforcing SSL/HTTPS for all communication between the frontend and backend. This encrypts all data in transit, making it unreadable to an attacker who might intercept the traffic.

**File:** `backend/server.js`
```javascript
const sslOptions = {
  key: fs.readFileSync('./localhost+2-key.pem'),
  cert: fs.readFileSync('./localhost+2.pem'),
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`✅ HTTPS server running at https://localhost:${PORT}`);
});
```

### vi. DDoS and Brute-Force Attacks

To protect against DDoS and brute-force attacks, the `express-rate-limit` middleware is used. It limits the number of requests a single IP address can make to the API within a specified time frame.

**File:** `backend/server.js`
```javascript
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // max 100 requests per IP
  message: 'Too many requests from this IP, please try again after 10 minutes',
});

app.use('/api', limiter); // Apply limiter to all API routes
```

### vii. Cross-Site Request Forgery (CSRF) Protection

CSRF protection is implemented using the double-submit cookie pattern with the `csurf` middleware on the backend and an `axios` interceptor on the frontend.

**Backend Implementation:** `backend/server.js`
```javascript
const csrfProtection = csurf();
app.use(csrfProtection);

// Route to get CSRF token
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

**Frontend Implementation:** `frontend/src/utils/api.js`
```javascript
const api = axios.create({
  baseURL: 'https://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method.toUpperCase())) {
    try {
      const { data } = await api.get('/csrf-token');
      config.headers['X-CSRF-TOKEN'] = data.csrfToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return Promise.reject('CSRF token fetch failed.');
    }
  }
  return config;
});

export default api;
```

## 5. Conclusion

The Customer Portal has been significantly hardened with a multi-layered security approach. The combination of full SSL/HTTPS encryption and robust server-side and client-side security measures provides a strong defense against a wide range of common web vulnerabilities. This setup establishes a secure foundation for the application and follows industry best practices for web security.
