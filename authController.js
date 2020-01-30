const bcrypt = require('bcryptjs');

module.exports = {
    //async allows this function to run asynchronously
    register: async(req, res) => {
        //email and password from client-side
        const {email, password} = req.body;
        //get db
        const db = req.app.get('db');

        //check if the user is already in the database. Await waits for the response.
        let user = await db.check_user(email);
        //if there is a user, return a response letting the client know the user is already there.
        if(user[0]){
            return res.status(400).send('User already exists')
        }

        //if the user is not there, start creating the hash from the users password. This is done by first generating a salt. genSaltSync takes a number argument for how many characters you would like the salt to be.
        let salt = bcrypt.genSaltSync(10);

        //hashSync bundles the password and salt together and then hashes them
        let hash = bcrypt.hashSync(password, salt);

        //create a new user by inserting the email and hash into the database.
        let newUser = await db.register_user(email, hash);

        //place the user on a session
        req.session.user = newUser[0];
        //send the session to the client-side
        res.status(201).send(req.session.user);
    },
    login: async(req, res) => {
        const {email, password} = req.body;
        const db = req.app.get('db');

        //check if the user exists in the database
        let user = await db.check_user(email);
        //if the user doesn't exist, return a response letting the client know
        if(!user[0]){
            return res.status(400).send('Email not found');
        }

        //if the user does exist in the db, make sure their password is correct by running compareSync, passing in the password from req.body, and the password from the user variable.
        let authenticated = bcrypt.compareSync(password, user[0].password);

        //if the password is incorrect, return a response to the client to let them know
        if(!authenticated){
            return res.status(401).send('Password is incorrect');
        }

        //delete the password off of the user object
        delete user[0].password;

        //place the user on a session
        req.session.user = user[0];

        //send the session to the client-side
        res.status(202).send(req.session.user);
    },
    logout: (req, res) => {
        //destroy what's on the session object
        req.session.destroy();
        //return an OK status
        res.sendStatus(200);
    },
    getUser: (req, res) => {
        //check if the user is on session
        if(req.session.user){
            //if they are, send the session to the client side
            res.status(200).send(req.session.user);
        } else {
            //if they aren't, send a response letting the client-side know
            res.status(200).send('No user on session');
        }
    }
}