const mongoose = require('../db')
const User = require('../model/user')

export async function login(req, res) {
    const userExist = await User.findOne({ email: req.body.email })
    if (!userExist) {
        const newUser = new User({
            email: req.body.email,
            authId: req.body.authId,
            name: req.body.name,
            useGooglePhoto: true,
            profilePhotoURL: req.body.photoURL,
            rating: 0,
        })

        newUser.save()
    }

    res.end(JSON.stringify({ status: 200 }))
}

export async function updateUser(req, res) {
    const session = await mongoose.startSession()
    try {
        if (!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        if (req.params.email) {
            await session.startTransaction()

            await User.findOneAndUpdate({ email: req.params.email }, req.body)

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

export async function getUserByEmail(req, res) {
    try {
        if (req.params.email) {
            const user = await User.findOne({ email: req.params.email })
            if (user) res.status(200).send({ users: user })
            else res.status(404).send({ error: 'User not found' })
        } else {
            const users = await User.find()
            res.status(200).send({ users: users })
        }
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

export async function getUserById(req, res) {
    try {
        if (req.params.id) {
            const user = await User.findById({ _id: req.params.id })
            if (user) res.status(200).send({ users: user })
            else res.status(404).send({ error: 'User not found' })
        } else {
            const users = await User.find()
            res.status(200).send({ users: users })
        }
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

export async function updateUserById(req, res) {
    const session = await mongoose.startSession()
    try {
        if (!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        if (req.params.id) {
            await session.startTransaction()
            const user = await User.findById({ _id: req.params.id })
            if (user) {
                user.set(req.body)
                await user.save()

                await session.commitTransaction()
                session.endSession()

                res.status(200).send({ authId: user.authId })
            }
            else res.status(404).send({ error: 'User not found' })
        } else {
            const users = await User.find()
            res.status(200).send({ users: users })
        }
    } catch (error) {
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        res.status(500).send({ error: error.message })
    }
}