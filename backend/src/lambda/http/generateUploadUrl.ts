require('source-map-support').install();
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
//import * as uuid from 'uuid';
//import * as middy from 'middy'
import { createLogger } from '../../utils/logger'
import { updateTodoUrl } from '../../businessLogic/todos';

//export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const logger = createLogger('todos')
  const todoId = event.pathParameters.todoId

  const s3 = new AWS.S3({ 
    signatureVersion: 'v4' 
  });

  const presignedUploadUrl = s3.getSignedUrl('putObject', {
    Bucket: process.env.S3_BUCKET,
    Key: todoId,
    Expires: parseInt(process.env.SIGNED_URL_EXPIRATION)
  })

  logger.info("Presigned URL: "+presignedUploadUrl)

  try {
    await updateTodoUrl(todoId,jwtToken)
  } catch (error) {
    logger.info(error)
  }
  
  logger.info("Presigned url generated successfully ", presignedUploadUrl)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: presignedUploadUrl
    })
  }
}

