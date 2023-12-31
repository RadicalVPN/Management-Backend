import Ajv from "ajv"
import ajvFormats from "ajv-formats"
import fs from "fs/promises"
import * as path from "path"

export class JSONSchemaValidator {
    private static ajv = new Ajv({
        removeAdditional: "all",
        useDefaults: "empty",
    })

    constructor() {}

    static async setup() {
        console.log("setting up json schema validator")

        //load ajv formats
        ajvFormats(JSONSchemaValidator.ajv)

        await this.loadSchemas()

        return this
    }

    static async loadSchemas() {
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
