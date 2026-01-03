import z from "zod"

const adminEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_USERNAME: z.string().min(1, "DATABASE_USERNAME is required"),
    DATABASE_PASSWORD: z.string().min(1, "DATABASE_PASSWORD is required"),
    DATABASE_HOST: z.string().min(1, "DATABASE_HOST is required"),
    DATABASE_PORT: z.coerce.number().default(5432),
    DATABASE_NAME: z.string().min(1, "DATABASE_NAME is required"),
    PORT: z.coerce.number().default(3000),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),
})

let parsedEnv: z.infer<typeof adminEnvSchema> | null = null

export const readAdminEnv = () => {
    if (parsedEnv) return parsedEnv
    parsedEnv = adminEnvSchema.parse(process.env)
    console.log("Admin environment variables loaded", parsedEnv)
    return parsedEnv
}