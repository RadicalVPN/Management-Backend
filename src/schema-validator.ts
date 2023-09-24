import Ajv from "ajv"
import ajvFormats from "ajv-formats"
import fs from "fs/promises"
import * as path from "path"

export class JSONSchemaValidator {
    private static ajv = new Ajv({
        removeAdditional: "all",
    })

    static async create() {
        return await new JSONSchemaValidator().setup()
    }

    constructor() {}

    private async setup() {
        if (Object.keys(JSONSchemaValidator.ajv.schemas).length < 2) {
            //load ajv formats
            ajvFormats(JSONSchemaValidator.ajv)

            await this.loadSchemas()
        }

        return this
    }

    private async loadSchemas() {
        console.log("loading schema files")
        const schemaPath = "./schemas"

        const files = await fs.readdir(schemaPath)
        for (const file of files) {
            const filePath = path.join(schemaPath, file)
            const content = JSON.parse(
                await fs.readFile(filePath, {
                    encoding: "utf-8",
                }),
            )

            console.log(`loading json schema from ${filePath}`)

            if (JSONSchemaValidator.ajv.getSchema(content.$id)) {
                continue
            }

            JSONSchemaValidator.ajv.addSchema(content)
        }
    }

    validate(schema: string, data: any) {
        const valid = JSONSchemaValidator.ajv.validate(schema, data)

        if (!valid) {
            return {
                valid: false,
                errors: JSONSchemaValidator.ajv.errors,
            }
        }

        return {
            valid: true,
            data,
        }
    }
}
