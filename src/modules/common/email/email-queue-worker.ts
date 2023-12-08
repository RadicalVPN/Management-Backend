import { Job, Worker } from "bullmq"
import { EmailQueueManager } from "./email-queue-manager"
import { EmailTemplateEngine } from "./email-template-engine"
import { IEmailJob } from "./types"

export class EmailQueueWorker {
    queueName = "email_queue"

    constructor() {}

    startWorker() {
        const worker = new Worker(
            this.queueName,
            this.handleJob,
            EmailQueueManager.getQueueConfig(),
        )

        console.log("Started E-Mail Queue Worker", worker.id)

        //register event listeners
        worker.on("failed", this.handleFailure)

        return worker
    }

    private handleFailure(
        job: Job<IEmailJob, void, string> | undefined,
        error: Error,
        prev: string,
    ) {
        console.log("e-mail queue job failed", {
            id: job?.id,
            name: job?.name,
            error,
            prev,
        })
    }

    private async handleJob(job: Job<IEmailJob>) {
        const { id, name, data } = job
        const engine = new EmailTemplateEngine()

        console.log("handling e-mail queue job", { id, name })

        await engine.sendTemplate(
            {
                templateName: data.templateName,
                templateData: data.templateData,
            },
            data.to,
            data.subject,
        )
    }
}
