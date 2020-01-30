require('dotenv').config();
const express = require('express'),
      session = require('express-session'),
      massive = require('massive'),
      cors = require('cors'),
      {SERVER_PORT, SESSION_SECRET, CONNECTION_STRING} = process.env,
      authCtrl = require('./authController'),
      app = express();

app.use(cors());
app.use(express.json());

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    cookie: {maxAge: 1000 * 60 * 60}
}))

massive(CONNECTION_STRING).then(db => {
    app.set('db', db);
    console.log('db connected');
})

app.post('/api/logout', authCtrl.logout);
app.post('/api/register', authCtrl.register);
app.post('/api/login', authCtrl.login);
app.get('/api/user', authCtrl.getUser);

const port = SERVER_PORT;
app.listen(port, () => console.log(`Server running on ${port}`));