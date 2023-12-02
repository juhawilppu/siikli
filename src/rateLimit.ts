import { createRedisClient } from "./redis"

export const rateLimit = async (namespace: string, req: any, maxAttempts: number, timewindow: number) => {
    const redis = createRedisClient()
    await redis.connect()
    const key = `${namespace}`
    const attemptsSoFar = parseInt(await redis.get(key) || '0')
    if (attemptsSoFar >= maxAttempts) {
        return { success: false, limit: maxAttempts, remaining: 0}
    }
    
    await redis.incr(key)
    return { success: true, limit: maxAttempts, remaining: attemptsSoFar + 1 }

}