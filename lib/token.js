import crypto from 'crypto'

export const generateSalt = length => (
  crypto
    .randomBytes(length)
    .toString('hex')
)

export const generateHash = data => crypto.createHash('sha256').update(data)
export const generateToken = (tokenItems, delimiter) => {
  return Buffer
    .from(tokenItems.join(delimiter))
    .toString('base64')
}

export const isAppTokenExpired = (tokenTimestamp) => {
  const today = new Date()
  const tokenDate = new Date(tokenTimestamp)
  const tokenExpirationDate = new Date(tokenTimestamp)
  tokenExpirationDate.setDate(tokenDate.getDate() + 1)

  return tokenExpirationDate.getTime() > today.getTime()
}

export const isTokenValid = (token) => {
  const data = Buffer.from(token, 'base64')
  const decodedData = data.toString('ascii')
  const apiSecret = process.env.CLOUDWATCH_POSTMAN_SECRET_KEY

  const [ date, salt, secret ] = decodedData.split('::')

  if (isAppTokenExpired(date)) return false

  const apiHash = generateHash(`${date}${salt}${apiSecret}`).digest('base64')
  const providedHash = generateHash(`${date}${salt}${secret}`).digest('base64')

  return apiHash == providedHash
}

export const createAccessToken = () => {
  const date = new Date().getTime()
  const salt = generateSalt(12)
  const secret = process.env.CLOUDWATCH_POSTMAN_SECRET_KEY
  const delimiter = '::'
  const hash = generateHash(`${date}${salt}${secret}`)

  return generateToken([date, salt, secret], delimiter)
}
