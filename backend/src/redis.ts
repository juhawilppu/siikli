import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from 'redis'
import { log } from './utils/app-log'

// Always load root-level .env
dotenv.config({
  path: path.join(process.cwd(), '../.env'),
})

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on('error', err => log.error('Redis Client Error', err))

redisClient.on('connect', () => log.info('Redis Client Connected'))

export default redisClient
