import ejs from "ejs"
import fs from "fs/promises"
import path from "path"
import { Email } from "./email"

type TTemplateDataOptions = Record<string, any>

export class EmailTemplateEngine extends Email {
    template: string
    templateData: TTemplateDataOptions

    constructor(template: string, templateData: TTemplateDataOptions) {
        super()

        this.template = template
        this.templateData = templateData
    }

    async sendTemplate(to: string, subject: string) {
        const html = await this.renderTemplate(this.template, this.templateData)
        if (!html) {
            console.error("skip sending email, invalid template")
            return
        }

        await super.send(to, html, subject)
    }

    private async renderTemplate(
        templateName: string,
        data: TTemplateDataOptions,
    ): Promise<string | undefined> {
        console.log(process.cwd())
        const template = await fs.readFile(
            path.join(process.cwd(), "templates", templateName) + ".ejs",
            "utf-8",
        )

        let html
        try {
            html = await ejs.render(template, data, {
                async: true,
            })
        } catch (e) {
            console.error("failed to render template", e)
        }

        return html
    }
}
