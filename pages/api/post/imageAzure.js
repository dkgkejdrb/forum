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
    // 스토리지 연결문자열, 환경변수 사용
    const AZURE_STORAGE_CONNECTION_STRING = 
  process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error('Azure Storage Connection string not found');
}

// Create the BlobServiceClient object with connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);


    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

    if (!accountName) throw Error('Azure Storage accountName not found');

    console.log("Azure Blob storage v12 - JavaScript quickstart sample");


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
