import nodemailer from "nodemailer"
import { Attachment } from "nodemailer/lib/mailer"
import { config } from "../../../config"

export class Email {
    protected static transport = Email.createTransport()

    constructor() {}

    protected async send(
        to: string | string[],
        htmlBody: string,
        subject: string,
        attachments: Attachment[] = [],
        from = "RadicalVPN",
    ) {
        to = typeof to === "string" ? [to] : to

        console.log(`sending email "${subject}" to ${to}`)

        const info = await Email.transport.sendMail({
            from: `"${from}" <${config.SMTP.FROM}>`,
            to: to.join(", "),
            subject: subject,
            attachments: attachments,
            html: htmlBody,
        })

        console.log(
            `email sent to "${to}": ${info.messageId} (${info.response}) (${info.accepted})`,
        )
    }

    private static createTransport() {
        return nodemailer.createTransport({
            port: config.SMTP.PORT,
            host: config.SMTP.HOST,
            secure: true,
            tls: {
                rejectUnauthorized: false,
            },
            auth: {
                user: config.SMTP.USERNAME,
                pass: config.SMTP.PASSWORD,
            },
            pool: true,
        })
    }
}
