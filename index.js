const express = require('express');
const app = express();
const CAS = require('cas');

// CAS configuration
const cas = new CAS({
  base_url: 'https://shib.idm.umd.edu/shibboleth-idp/profile/cas',
  version: 3.0,
  service: 'login.umd.edu/cas',
  //host: 'cas-server:8080', 'protocol': 'http'
});


app.use((req, res, next) => {
  cas.authenticate(req, res, (err, status, username, extended) => {
    if (err) {
      // Handle the error
      console.log("error:", err);
      res.send({ error: 'CAS Authentication Error' });
    } else {
      // If authentication is successful, add CAS information to the session
      req.session.cas = {
        user: username,
        attributes: extended.attributes,
      };
      next();
    }
  });
});

// Define a route for the home page
app.get('/', (req, res) => {
  res.send(`Hello, ${req.session.cas && req.session.cas.user}! <a href="/logout">Logout</a>`);
});

// Define a route for logout
app.get('/logout', cas.logout);

// Start the server
const port = 443;
const ip = '29-143.pool.cnw.net';
////'cas-server:4000';
app.listen(port, ip, () => {
  console.log(`Server running on http://${ip}:${port}`);
});
