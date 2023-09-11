export class Base32 {
    private static alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

    static encode(buffer: Buffer): string {
        const length = buffer.byteLength

        let bits = 0
        let value = 0
        let output = ""

        for (let i = 0; i < length; i++) {
            value = (value << 8) | buffer[i]!
            bits += 8

            while (bits >= 5) {
                output += Base32.alphabet[(value >>> (bits - 5)) & 31]
                bits -= 5
            }
        }

        if (bits > 0) {
            output += Base32.alphabet[(value << (5 - bits)) & 31]
        }

        while (output.length % 8 !== 0) {
            output += "="
        }

        return output
    }

    static decode(input: string): Buffer {
        const cleanedInput: string = input.toUpperCase().replace(/=+$/, "")
        const { length } = cleanedInput

        let bits = 0
        let value = 0

        let index = 0
        const output = Buffer.alloc(((length * 5) / 8) | 0)

        for (let i = 0; i < length; i++) {
            value =
                (value << 5) |
                Base32.readChar(Base32.alphabet, cleanedInput[i]!)
            bits += 5

            if (bits >= 8) {
                output[index++] = (value >>> (bits - 8)) & 255
                bits -= 8
            }
        }

        return output
    }

    private static readChar(alphabet: string, char: string): number {
        const idx = alphabet.indexOf(char)

        if (idx === -1) {
            throw new Error("Invalid character found: " + char)
        }

        return idx
    }
}
