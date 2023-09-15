const express = require('express')
const mongoose = require('mongoose')
const app = express()
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer')

const User = require('./model/user')

require('dotenv').config()

app.use(express.json())

const URI = process.env.MONGODB_URI ? process.env.MONGODB_URI : ''

async function connect(){
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB')
    } catch(error){
        console.log(error)
    }
}

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

app.post('/user/login', checkJwt, async (req , res) => {
    console.log('login api check')

    await connect();
    const userExist = await User.findOne({name: 'anna'});
    if(!userExist) {
        const newUser = new User({
            name: 'anna',
            lastname: 'pominchuk',
        })

        newUser.save()
    }

    res.end(JSON.stringify({status: 200}));
})

app.listen(8000, () => {
    console.log("Server started on port 8000")
})

