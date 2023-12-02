import { createClient } from 'redis';

export const testRedis = async () => {

    console.log(`|${process.env.REDIS_USERNAME}|`)
    console.log(`|${process.env.REDIS_SECRET}|`)

    const client = createClient({
        username: process.env.REDIS_USERNAME, // use your Redis user. More info https://redis.io/docs/management/security/acl/
        password: process.env.REDIS_SECRET, // use your password here
        socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT as string),
            tls: false,
        }
    });
    await client.connect();

    await client.set('example', 'hello')
    const val = await client.get('example')
    console.log('example: ' + val)

}