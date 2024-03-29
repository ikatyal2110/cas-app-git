const express = require('express');
const session = require('express-session');
const app = express();
const CAS = require('cas');

// CAS configuration
const cas = new CAS({
  base_url: 'https://shib.idm.umd.edu/shibboleth-idp/profile/cas',
  version: 3.0,
  service: 'login.umd.edu/cas',
  //host: 'cas-server:8080', 'protocol': 'http'
});

app.use(session({
  secret: 'ca2b63f6e8d7e35fa057d9dcfe6f4c2c4c0e68cf8df07dd33979621b19eeb6b9',
  resave: false,
  saveUninitialized: true
}));

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

// Define a route for logout
app.get('/logout', (req, res) =>{
  res.send(cas.logout)
});

// Define a route for the home page
app.get('/', (req, res) => {
  res.send(`Hello, ${req.session.cas && req.session.cas.user}! <a href="/logout">Logout</a>`);
});

// Start the server
const port = 443;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
