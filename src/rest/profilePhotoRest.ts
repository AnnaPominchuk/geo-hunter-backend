const User = require('../model/user')

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const { uploadFile, getFileStream } = require('../utils/s3')

export async function uploadProfilePhoto(req, res) {
    try {
        const fileData = req.files[0]
        const file = await uploadFile(fileData)

        await unlinkFile(fileData.path)

        if (req.body.userId) {
            const user = await User.findById({ _id: req.body.userId })
            user.profilePhotoKey = file.Key
            user.useGooglePhoto = false
            await user.save()
        }

        res.status(200).end()
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: 'Internal server error' })
    }
}

export async function getProfilePhotoByUserId(req, res) {
    // TO DO: may be delete
    try {
        const userId = req.params.userId

        const user = await User.findById({ _id: userId })
        if (!user) return res.status(404).send({ error: 'Object not found' })

        const key = user.profilePhotoKey
        return res.status(200).send({ key })
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: 'Internal server error' })
    }
}

export async function getProfilePhotoByKey(req, res) {
    try {
        const key = req.params.key

        if (key) {
            const readStream = getFileStream(key)
            return readStream.pipe(res)
        }

        return res.status(404).send({ error: 'Not found' })
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: 'Internal server error' })
    }
}

export async function deleteProfilePhoto(req, res) {
    // TO DO: may be delete
    try {
        const userId = req.params.userId

        const user = await User.findById({ _id: userId })
        if (!user) return res.status(404).send({ error: 'Object not found' })

        user.profilePhotoKey = ''
        user.useGooglePhoto = false
        await user.save()

        return res.status(200).send()
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: 'Internal server error' })
    }
}
