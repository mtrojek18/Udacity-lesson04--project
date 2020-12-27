// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '4hjfku066h'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-qvcwhgvd.us.auth0.com',           // Auth0 domain
  clientId: 'jiJ1F0Pjz7F0vKwHDSnmsb065Shh5W4T',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
