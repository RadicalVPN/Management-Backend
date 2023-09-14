import * as redis from "redis"

export class Redis {
    private static client: redis.RedisClientType<redis.RedisDefaultModules>

    static async getInstance() {
        if (Redis.client) return Redis.client

        Redis.client = redis
            .createClient()
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
