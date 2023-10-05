const express = require('express')
const mongoose = require('./db');
const axios = require('axios');

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const multer = require('multer');
const upload = multer({dest:'uploads/'}).any('images') ;

const app = express()
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer')

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const { uploadFile, getFileStream } = require('./s3')

const User = require('./model/user')
const Shop = require('./model/shop')
const Review = require('./model/review')

require('dotenv').config()

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

// app.use(checkJwt)

app.post('/user/login', checkJwt, async (req , res) => {
    console.log('login api check')

    const userExist = await User.findOne({email: req.body.email});
    if(!userExist) {
        const newUser = new User({
            email: req.body.email,
            name: req.body.name,
            lastname: req.body.lastname,
        })

        newUser.save()
    }

    res.end(JSON.stringify({status: 200}));
})

app.post('/shop/create', async (req , res) => {
    
    const session = await mongoose.startSession()
    try {
        if(!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        await session.startTransaction()

        if(!req.body.csvBuffer)
            res.status(500).send({error: 'Bad Request'})

        const csvShops = req.body.csvBuffer.split('\n')
        const header = csvShops[0].split(';')

        for(let i = 1; i < csvShops.length; i++){
            let shopData = csvShops[i].split(';')
            let newObj = {}
            for(let j = 0; j < shopData.length; j++){
                if(shopData[j]) {
                    newObj[header[j].trim()] = shopData[j].trim()
                }
            }

            const newShop = new Shop(newObj)
            await newShop.save({ session: session })
                .catch(async (error) => {
                    console.log(error)
                    return Promise.reject(error)
                });
        } 

        await session.commitTransaction()
        session.endSession()
        res.status(200).end()

    } catch (error) {
        console.error(error)
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        res.status(500).send({ error: 'Internal server error' })
    }
})

app.get('/shop', async (req , res) => {
    try {
        const shops = await Shop.find()
        res.status(200).send({shops: shops})
    } catch (error){
        res.status(500).send({error: error.message})
    }
})

app.get('/user/:email?', checkJwt, async (req , res) => {
    try {
        if (req.params.email) {
            const user = await User.findOne({email: req.params.email});
            if (user) res.status(200).send({users: user})
            else res.status(404).send({error: 'User not found'})
        }
        else {
            const users = await User.find()
            res.status(200).send({users: users})
        }
    } catch (error){
        res.status(500).send({error: error.message})
    }
})

app.get('/review/user/:userId?', checkJwt, async (req , res) => {
    try {
        if (req.params.userId) {
            const reviews = await Review.find({userId: req.params.userId});
            res.status(200).send({reviews: reviews})
        }
        else {
            const reviews = await Review.find()
            res.status(200).send({reviews: reviews})
        }
    } catch (error){
        res.status(500).send({error: error.message})
    }
})

app.patch('/review/:reviewId?', checkJwt, async (req , res) => {
    const session = await mongoose.startSession()
    try {
        if(!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        if (req.params.reviewId) {
            await session.startTransaction()

            const {status} = req.body

            await  Review.findByIdAndUpdate(
                req.params.reviewId, 
                {status: status}
            );

            await session.commitTransaction()
            session.endSession()

            res.status(200).end()
        }
        else
            return res.status(404).send({error: 'Object not found'})
    } catch (error){
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        res.status(500).send({error: error.message})
    }
})

app.post('/review/upload', checkJwt, async (req, res) => { // TO DO: naming
    const session = await mongoose.startSession()
    try {
        if(!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        await session.startTransaction()

        const { 
            shopId, 
            userId, 
        } = req.body;

        const user = await User.findById({_id: userId});
        if (!user)
            return res.status(500).send({error: 'Bad Request'})

        const shop = await Shop.findById({_id: shopId});
        if (!shop)
            return res.status(500).send({error: 'Bad Request'})

        const newReview = new Review(req.body)

        await newReview.save({ session: session })

        await session.commitTransaction()
        session.endSession()
        res.status(200).send({reviewId: newReview._id})
    } catch (error) {
        console.error(error)
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        res.status(500).send({ error: 'Internal server error' })
    }
})

app.post('/images', upload, checkJwt, async function (req, res) {
    const session = await mongoose.startSession()
    try {
        if(!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        const files = req.files
        let results = []

        for await (const file of files) {
            const r = await uploadFile(file)
            results.push(r)
            await unlinkFile(file.path) // unlink from filesystem
        }

        await session.startTransaction()

        if (req.body.reviewId) {
            const review = await Review.findById({_id: req.body.reviewId});

            if (review)
            {
                for await (const result of results) {
                    review.images.push(result.Key)
                }
                await review.save({ session: session })
            }
        }

        await session.commitTransaction()
        session.endSession()

        res.status(200).end()
    } catch (error) {
        console.error(error)
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        res.status(500).send({ error: 'Internal server error' })
    }
})

app.get('/images/shop/:shopId', checkJwt, async (req, res) => {
    const shopId = req.params.shopId;

    const shop = await Shop.findById({_id: shopId});
    if (!shop)
        return res.status(404).send({error: 'Object not found'})

    const reviews = await Review.find({shopId: shopId});

    let imageKeys = []
    reviews?.forEach(review => {
        imageKeys = [...imageKeys, ...review.images]
    });

    return res.status(200).send(imageKeys) 
})

app.get('/images/:key', async (req, res) => { // TO DO: checkJwt
    const key = req.params.key

    if (key) {
        const readStream = getFileStream(key)
        return readStream.pipe(res)
    }
    else return res.status(404).send({error: 'Not found'}) 
})

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    
    const port = 8000;
    app.listen(port, () => {
        console.log("Server started on port 8000")
    });
  });
  
  mongoose.connection.on('error', (error) => {
    console.error('Error connecting to MongoDB:', error)
  });
