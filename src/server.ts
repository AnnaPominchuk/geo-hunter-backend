const express = require('express')
const mongoose = require('./db')

const multer = require('multer')
const upload = multer({ dest: 'uploads/' }).any('images')

const app = express()
const { auth } = require('express-oauth2-jwt-bearer')

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const userRest = require('./rest/userRest')
const shopRest = require('./rest/shopRest')
const reviewRest = require('./rest/reviewRest')
const imagesRest = require('./rest/imagesRest')
const profilePhotoRest = require('./rest/profilePhotoRest')

const { checkReviewByIdPerm, checkReviewByUserPerm } = require('./utils/permissions')

require('dotenv').config()

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER,
})

app.post('/user/login', checkJwt, userRest.login)
app.patch('/user/:email?', checkJwt, userRest.updateUser)
app.get('/user/:email?', checkJwt, userRest.getUserByEmail)

app.post('/shop/create', checkJwt, shopRest.uploadShopsInfo)
app.get('/shop', checkJwt, shopRest.getShopById)

app.get('/review/user/:userId?', checkJwt, checkReviewByUserPerm, reviewRest.getReviewsByUserId)
app.get('/review/:reviewId?', checkJwt, checkReviewByIdPerm, reviewRest.getReviewByReviewId)
app.patch('/review/:reviewId?', checkJwt, checkReviewByIdPerm, reviewRest.updateReviewStatus)
app.post('/review/upload', checkJwt, reviewRest.uploadReview)

app.post('/images', upload, checkJwt, imagesRest.uploadImages)
app.get('/images/shop/:shopId', checkJwt, imagesRest.getImagesByShopId)
app.get('/images/review/:reviewId', checkJwt, imagesRest.getImagesByReviewId)
app.get('/images/:key', checkJwt, imagesRest.getImageByKey)

app.post(
    '/profile-photo/upload',
    upload,
    checkJwt,
    profilePhotoRest.uploadProfilePhoto
)
app.get(
    '/profile-photo/user/:userId',
    checkJwt,
    profilePhotoRest.getProfilePhotoByUserId
)

app.get('/profile-photo/:key', checkJwt, profilePhotoRest.getProfilePhotoByKey)
app.get(
    '/profile-photo/delete/:userId',
    checkJwt,
    profilePhotoRest.deleteProfilePhoto
)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')

    const port = 8000
    app.listen(port, () => {
        console.log('Server started on port 8000')
    })
})

mongoose.connection.on('error', (error) => {
    console.error('Error connecting to MongoDB:', error)
})
