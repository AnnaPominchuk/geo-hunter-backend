const { Upload } = require('@aws-sdk/lib-storage')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')

require('dotenv').config()
const fs = require('fs')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION

const s3Client = new S3Client({
    region,
})

// uploads a file to s3
function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename,
    }

    return new Upload({
        client: s3Client,
        params: uploadParams,
    }).done()
}
exports.uploadFile = uploadFile

// downloads a file from s3
async function getFileStream(fileKey) {
    const command = new GetObjectCommand({
        Key: fileKey,
        Bucket: bucketName,
    })

    return s3Client.send(command)
}
exports.getFileStream = getFileStream
