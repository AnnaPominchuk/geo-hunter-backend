const nodemailer = require('nodemailer');
const User = require('./model/user')

require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST || '',
    port: process.env.NODEMAILER_PORT || '',
    auth: {
        user: process.env.NODEMAILER_USER || '',
        pass: process.env.NODEMAILER_PASS || ''
    }
})

async function notifyAllAdmins () {
    try {
        const admins:typeof User[] = await User.find({roles: ["Admin"]})

        const emails:string[] = admins.map((item): string => {
            return item.email;
        })

        // TO DO: for testing
        //emails = [...emails, ...["yulyapominchuk@gmail.com", "pominchuk.anna@gmail.com"]]

        const message = {
            from: 
            {  
                name: "Geo Hunter",
                email: process.env.NODEMAILER_EMAIL || '',
            },
            to: emails,
            subject: "New review was created",
            text: "Hello SMTP Email"
        }
        await transporter.sendMail(message, (err, info) => {
            if (err) {
            console.log(err)
            } else {
            console.log(info);
            }
        })
    } catch (err){
        console.log(err)
    }
}

exports.notifyAllAdmins = notifyAllAdmins