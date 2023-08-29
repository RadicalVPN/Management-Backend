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
            await this.loadSchemas()

            //load ajv formats
            ajvFormats(JSONSchemaValidator.ajv)
        }

        return this
    }

    private async loadSchemas() {
        console.log("loading schema files")
        const schemaPath = "./schemas"

        const files = await fs.readdir(schemaPath)
        for (const file of files) {
            const filePath = path.join(schemaPath, file)

            console.log(`loading json schema from ${filePath}`)

            JSONSchemaValidator.ajv.addSchema(
                JSON.parse(
                    await fs.readFile(filePath, {
                        encoding: "utf-8",
                    }),
                ),
            )
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
