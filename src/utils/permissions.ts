const Review = require('../model/review')
const User = require('../model/user')

const checkReviewByIdPerm = async (req, res, next) => {
    const check = async (req) => {
        const { appRoles, sub } = req.auth.payload

        if (appRoles?.includes("Admin"))
            return true;

        if (req.params.reviewId) {
            try {
                const review = await Review.findById({ _id: req.params.reviewId })
                if (review) {
                    const user = await User.findById({ _id: review.userId })
                    return user?.auth0Id == sub
                }
            } catch (error) {
                res.status(500).send({ error: 'Failed to fetch' })
            }
        }
        return false
    }
    if ( await check(req) ) next()
    else res.status(500).send({ error: 'Failed to fetch' })
}

const checkReviewByUserPerm = async (req, res, next) => {
    const check = async (req) => {
        const { appRoles, sub } = req.auth.payload

        if (appRoles?.includes("Admin"))
            return true;

        if (req.params.userId) {
            try {
                const user = await User.findById({ _id: req.params.userId })
                return user?.auth0Id == sub
            } catch (error) {
                res.status(500).send({ error: 'Failed to fetch' })
            }
        }
        return false
    }
    if ( await check(req) ) next()
    else res.status(500).send({ error: 'Failed to fetch' })
}

exports.checkReviewByIdPerm = checkReviewByIdPerm
exports.checkReviewByUserPerm = checkReviewByUserPerm