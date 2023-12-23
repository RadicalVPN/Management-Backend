import * as redis from "redis"
import { config } from "../config"

type RedisClient = redis.RedisClientType<redis.RedisDefaultModules>

export class Redis {
    private static client: RedisClient

    static async getOrPut(
        key: string,
        cb: (redis: RedisClient) => Promise<any>,
        options: redis.SetOptions = {},
    ) {
        const redis = await Redis.getInstance()
        const cached = await redis.get(key)
        if (cached) {
            return JSON.parse(cached)
        }

        const result = await cb(redis)
        await redis.set(key, JSON.stringify(result), options)

        return result
    }

    static async getInstance() {
        if (Redis.client) {
            return Redis.client
        }

        Redis.client = redis
            .createClient({
                url: config.REDIS.URI,
            })
            .on("error", (err) =>
                console.error(
                    "failed to connect to redis server:",
                    err.toString(),
                ),
            ) as redis.RedisClientType

        await Redis.client.connect()

        console.log("connected to redis server")

        return Redis.client
    }
}
