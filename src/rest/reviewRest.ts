const mongoose = require('../db')
const Review = require('../model/review')
const User = require('../model/user')
const Shop = require('../model/shop')
const { notifyAllAdmins } = require('../utils/mailer')

export async function getReviewsByUserId(req, res) {
    try {
        if (req.params.userId) {
            const reviews = await Review.find({ userId: req.params.userId })
            res.status(200).send({ reviews: reviews })
        } else {
            const reviews = await Review.find()
            res.status(200).send({ reviews: reviews })
        }
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

export async function getReviewByReviewId(req, res) {
    try {
        if (req.params.reviewId) {
            const review = await Review.findById({ _id: req.params.reviewId })
            if (review) return res.status(200).send(review)
        }

        return res.status(404).end()
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

export async function updateReviewStatus(req, res) {
    const session = await mongoose.startSession()
    try {
        if (!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        if (req.params.reviewId) {
            await session.startTransaction()

            const { status, options } = req.body
            let { rating } = req.body

            const review = await Review.findById({ _id: req.params.reviewId })

            if (!review) {
                session.endSession()
                return res.status(404).send({ error: 'Object not found' })
            }

            if (status === 'Rejected') rating = 0

            if (status != review.status) {
                const user = await User.findById({ _id: review.userId })

                if (user) {
                    let points: number = user.rating

                    if (status === 'Rejected') points -= review.rating
                    if (status === 'Approved') points += parseInt(rating)

                    user.set({ rating: points > 0 ? points : 0 })
                    await user.save()
                }
            }

            if (status === 'Approved') {
                if (options && options.saveAddress) {
                    const shop = await Shop.findById({ _id: review.shopId })

                    if (shop) {
                        shop.set({
                            address: review.address,
                            latitude: review.latitude,
                            longitude: review.longitude,
                        })
                        await shop.save()
                    }
                }
            }

            review.set({ status: status, rating: rating })
            await review.save()

            await session.commitTransaction()
            session.endSession()

            res.status(200).end()
        } else return res.status(404).send({ error: 'Object not found' })
    } catch (error) {
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        res.status(500).send({ error: error.message })
    }
}

export async function uploadReview(req, res) {
    const session = await mongoose.startSession()
    try {
        if (!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        await session.startTransaction()

        const { shopId, userId } = req.body

        const user = await User.findById({ _id: userId })
        if (!user) return res.status(500).send({ error: 'Bad Request' })

        const shop = await Shop.findById({ _id: shopId })
        if (!shop) return res.status(500).send({ error: 'Bad Request' })

        const newReview = new Review(req.body)

        await newReview.save({ session: session })

        await session.commitTransaction()
        session.endSession()

        await notifyAllAdmins(user.name)

        res.status(200).send({ reviewId: newReview._id })
    } catch (error) {
        console.error(error)
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        res.status(500).send({ error: 'Internal server error' })
    }
}
