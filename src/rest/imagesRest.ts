const mongoose = require('../db')
const Review = require('../model/review')
const Shop = require('../model/shop')

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const { uploadFile, getFileStream } = require('../utils/s3')

export async function uploadImages(req, res) {
    const session = await mongoose.startSession()
    const files = req.files
    try {
        if (!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        const results = []

        await session.startTransaction()

        for await (const file of files) {
            const r = await uploadFile(file)
            results.push(r)
        }

        if (req.body.reviewId) {
            const review = await Review.findById({ _id: req.body.reviewId })

            if (review) {
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
    } finally {
        for await (const file of files) {
            await unlinkFile(file.path) // unlink from filesystem
        }
    }
}

export async function getImagesByShopId(req, res) {
    try {
        const shopId = req.params.shopId

        const shop = await Shop.findById({ _id: shopId })
        if (!shop) return res.status(404).send({ error: 'Object not found' })

        const reviews = await Review.find({ shopId: shopId })

        let imageKeys = []
        reviews?.forEach((review) => {
            if (review.status === 'Approved')
                imageKeys = [...imageKeys, ...review.images]
        })

        return res.status(200).send(imageKeys)
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: 'Internal server error' })
    }
}

export async function getImagesByReviewId(req, res) {
    if (!req.params.reviewId)
        return res.status(404).send({ error: 'Object not found' })

    const review = await Review.findById({ _id: req.params.reviewId })

    if (!review) return res.status(404).send({ error: 'Object not found' })

    return res.status(200).send(review.images)
}

export async function getImageByKey(req, res) {
    try {
        const key = req.params.key

        if (key) {
            const responce = await getFileStream(key)
            return responce.Body.pipe(res)
        } else return res.status(404).send({ error: 'Not found' })
    } catch (err) {
        console.log(err)
        res.status(500).send({ error: 'Internal server error' })
    }
}
