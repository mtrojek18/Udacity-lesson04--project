import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
require('source-map-support').install();

//import { verify, decode } from 'jsonwebtoken'
import { decode,  verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { Jwt } from '../../auth/Jwt';
import jwkToPem from 'jwk-to-pem'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-qvcwhgvd.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  try {
    // on success, return payload
    const response = await Axios.get(jwksUrl);
    const responseData = response.data;
    const signingKey = responseData['keys'].find(key => key['kid'] === jwt['header']['kid']);
    if (!signingKey) {
      throw new Error('Invalid Signing key');
    }

    //var tokenVerified = verify(token,response.data,{algorithms:['RS256']})
    var tokenVerified = verify(token,jwkToPem(signingKey),{algorithms:['RS256']})
    logger.info("returning payload")
    return tokenVerified as JwtPayload

  } catch (err) {
    // on failure, return undefined
    logger.info("returning undefined")
    return undefined
  }  
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
