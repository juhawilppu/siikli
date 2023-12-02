import { createClient } from 'redis';

export const createRedisClient = () => {
    return createClient({
        username: process.env.REDIS_USERNAME, // use your Redis user. More info https://redis.io/docs/management/security/acl/
        password: process.env.REDIS_SECRET, // use your password here
        socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT as string),
            tls: false,
        }
    })
}