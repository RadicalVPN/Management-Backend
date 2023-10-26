import { Job, Queue, QueueOptions, Worker } from "bullmq"
import { config } from "../config"

export abstract class GenericEventQueue<T> {
    private readonly queue: Queue
    private readonly worker: Worker
    private readonly rescheduleTime: number
    private readonly queueName: string
    private readonly jobDelay: number

    constructor(config: {
        name: string
        rescheduleTime: number
        jobDelay?: number
    }) {
        this.rescheduleTime = config.rescheduleTime
        this.queueName = config.name
        this.jobDelay = config.jobDelay || 1000

        this.queue = new Queue(config.name, this.getBullMqQueueConfig())

        this.worker = new Worker(
            this.queue.name,
            this.computeJob,
            this.getBullMqQueueConfig(),
        )

        this.startRescheduler()
    }

    abstract computeJob(data: Job<T>): Promise<any>
    abstract getItems(): Promise<T[]>

    async getLength(): Promise<number> {
        return await this.queue.count()
    }

    private getBullMqQueueConfig(): QueueOptions {
        const url = new URL(config.REDIS.URI)
        return {
            connection: {
                host: url.hostname,
                port: parseInt(url.port || "6379"),
            },
            prefix: "generic_queue",
        } as QueueOptions
    }

    private startRescheduler() {
        setInterval(async () => {
            const items = await this.getItems()

            let lastJobDelay = this.jobDelay
            this.queue.addBulk(
                items.map((item) => {
                    return {
                        data: item,
                        name: `${this.queueName}_schedule_event`,
                        opts: {
                            delay: (lastJobDelay += this.jobDelay),
                            removeOnComplete: 100,
                        },
                    }
                }),
            )
        }, this.rescheduleTime)
    }
}
