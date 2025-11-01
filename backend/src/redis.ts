import { createClient } from 'redis'
import { log } from './utils/app-log'
import 'dotenv/config'

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on('error', err => log.error('Redis Client Error', err))

redisClient.on('connect', () => log.info('Redis Client Connected'))

export default redisClient
