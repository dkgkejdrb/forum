import nextConnect from "next-connect";
import multer from "multer";
const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
require("dotenv").config();
const { DefaultAzureCredential } = require('@azure/identity');

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method "${req.method}" Not Allowed` });
  },
});

apiRoute.use(multer().any());

apiRoute.post((req, res) => {
  const file = req.files[0];
  
  // Any logic with your data here
  try {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

    if (!accountName) throw Error('Azure Storage accountName not found');

    console.log("Azure Blob storage v12 - JavaScript quickstart sample");

    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net/images?sp=racwdli&st=2023-05-19T06:49:16Z&se=2023-05-19T14:49:16Z&spr=https&sv=2022-11-02&sr=c&sig=NL6wRQ7R14AEyZpPYVAomRh%2FeavoWyhT6lp2DPnHSys%3D`,
      new DefaultAzureCredential()
    );

    // Create a unique name for the container
    const containerName = 'images'

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create a unique name for the blob
    const fileName = file.originalname;
    const _fileLen = fileName.length;
    const _lastDot = fileName.lastIndexOf('.');
    const _fileExt = fileName.substring(_lastDot, _fileLen).toLowerCase();
    const blobName = uuidv1() + _fileExt;

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Display blob name and url
    console.log(
      `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
    );

    // Upload data to the blob
    const data = file.buffer;
    const uploadBlobResponse = blockBlobClient.upload(data, data.length);
    console.log(
      `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
    );

    res.send({ url: blockBlobClient.url })

  } catch (error) {
    console.log(error)
    res.send({ url: "" })
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
