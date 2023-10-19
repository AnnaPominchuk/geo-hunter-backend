const mongoose = require('../db')
const Shop = require('../model/shop')

export async function uploadShopsInfo(req, res) {
    const session = await mongoose.startSession()
    try {
        if (!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        await session.startTransaction()

        if (!req.body.csvBuffer) res.status(500).send({ error: 'Bad Request' })

        const csvShops = req.body.csvBuffer.split('\n')
        const header = csvShops[0].split(';')

        for (let i = 1; i < csvShops.length; i++) {
            const shopData = csvShops[i].split(';')
            const newObj = {}
            for (let j = 0; j < shopData.length; j++) {
                if (shopData[j]) {
                    newObj[header[j].trim()] = shopData[j].trim()
                }
            }

            const newShop = new Shop(newObj)
            await newShop.save({ session: session }).catch(async (error) => {
                console.log(error)
                return Promise.reject(error)
            })
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
}

export async function getShopById(req, res) {
    try {
        const shops = await Shop.find()
        res.status(200).send({ shops: shops })
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}
