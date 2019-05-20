import crypto from 'crypto'

export const generateSalt = length => crypto.randomBytes(length).toString('hex')
export const generateHash = data => (
  crypto.createHash('sha256').update(data).digest('base64')
)
export const generateToken = (tokenItems, delimiter) => {
  return Buffer
    .from(tokenItems.join(delimiter))
    .toString('base64')
}

export const isTokenExpired = (tokenTimestamp, expiration = { day: 1 }) => {
  const today = new Date()
  const tokenDate = new Date(tokenTimestamp)
  const tokenExpirationDate = new Date(tokenTimestamp)
  const { day, hour } = expiration

  if (day) {
    tokenExpirationDate.setDate(tokenDate.getDate() + day)
  }

  if (hour) {
    tokenExpirationDate.setHours(tokenDate.getHours() + hour)
  }

  return tokenExpirationDate.getTime() < today.getTime()
}

export const isAccessTokenValid = (token) => {
  const data = Buffer.from(token, 'base64')
  const decodedData = data.toString('ascii')
  const apiSecret = process.env.ACCESS_TOKEN_SECRET_KEY

  const [ date, salt, hash ] = decodedData.split('::')

  if (isTokenExpired(+date, { hour: 1 })) return false

  const apiHash = generateHash(`${date}${salt}${apiSecret}`)

  return apiHash == hash
}

export const isAppTokenValid = (token) => {
  const data = Buffer.from(token, 'base64')
  const decodedData = data.toString('ascii')
  const apiSecret = process.env.APP_SECRET_KEY

  const [ date, salt, hash ] = decodedData.split('::')

  if (isTokenExpired(+date)) return false

  const apiHash = generateHash(`${date}${salt}${apiSecret}`)

  return apiHash == hash
}

export const createAccessToken = () => {
  const date = new Date().getTime()
  const salt = generateSalt(12)
  const secret = process.env.ACCESS_TOKEN_SECRET_KEY
  const delimiter = '::'
  const hash = generateHash(`${date}${salt}${secret}`)

  return generateToken([date, salt, hash], delimiter)
}
