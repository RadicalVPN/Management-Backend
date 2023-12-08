import ejs from "ejs"
import fs from "fs/promises"
import path from "path"
import { Email } from "./email"

type TTemplateDataOptions = Record<string, any>
interface ITemplateArgs {
    templateName: string
    templateData: TTemplateDataOptions
}

export class EmailTemplateEngine extends Email {
    constructor() {
        super()
    }

    async sendTemplate(template: ITemplateArgs, to: string, subject: string) {
        const html = await this.renderTemplate(
            template.templateName,
            template.templateData,
        )
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
        const computedPath =
            path.join(process.cwd(), "templates", templateName) + ".ejs"
        const expectedPath = path.join(process.cwd(), "templates")

        if (!computedPath.startsWith(expectedPath)) {
            throw new Error("invalid template path")
        }

        const template = await fs.readFile(computedPath, "utf-8")

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
