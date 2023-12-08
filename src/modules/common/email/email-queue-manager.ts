import { Queue, QueueOptions } from "bullmq"
import { randomUUID } from "crypto"
import { config } from "../../../config"
import { IEmailJob } from "./types"

export class EmailQueueManager {
    queue: Queue
    private readonly queueName = "email_queue"

    constructor() {
        this.queue = this.getQueue()
    }

    async addJob(job: IEmailJob) {
        console.log(`adding email job to queue "${job.to}" - "${job.subject}"`)

        await this.queue.add(randomUUID(), job, {
            removeOnComplete: 100,
        })
    }

    private getQueue() {
        return new Queue(this.queueName, EmailQueueManager.getQueueConfig())
    }

    static getQueueConfig(): QueueOptions {
        const url = new URL(config.REDIS.URI)

        return {
            connection: {
                host: url.hostname,
                port: parseInt(url.port || "6379"),
            },
            prefix: "email_queue",
        }
    }
}
