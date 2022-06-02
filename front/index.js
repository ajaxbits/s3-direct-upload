import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { formatUrl } from "@aws-sdk/util-format-url";
import crypto from "crypto";
import { promisify } from "util";

const bucket = "alex-is-tired-quarantine";
const region = "us-west-1";
const credentials = {
  accessKeyId: "",
  secretAccessKey: "",
};

const client = new S3Client({
  region: region,
  credentials: credentials,
});

async function generateUploadURL() {
  const randomBytes = promisify(crypto.randomBytes);
  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString("hex");

  const putObjectCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: imageName,
  });
  const putUrl = await getSignedUrl(client, putObjectCommand, {
    expiresIn: 3600,
  });
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: imageName,
  });
  const getUrl = await getSignedUrl(client, getObjectCommand, {
    expiresIn: 3600,
  });
  return { putUrl, getUrl };
}

// init
const imageForm = document.querySelector("#imageForm");
const imageInput = document.querySelector("#imageInput");

imageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = imageInput.files[0];

  // get secure url from our server
  const { putUrl, getUrl } = await generateUploadURL();
  console.log(putUrl);
  console.log(getUrl);

  // post the image direclty to the s3 bucket
  await fetch(putUrl, {
    method: "PUT",
    body: file,
  });

  const img = document.createElement("img");
  img.src = getUrl;
  document.body.appendChild(img);
});
