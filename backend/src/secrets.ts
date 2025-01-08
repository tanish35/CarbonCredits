import { config } from "dotenv";
config();

console.log("🗝️  Loading environment variables...");
const secrets = {
  DATABASE_URL: process.env.DATABASE_URL!,
  PULSE_API_KEY: process.env.PULSE_API_KEY!,
  SECRET: process.env.SECRET!,
  SMTP_EMAIL: process.env.SMTP_EMAIL!,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD!,
  SMTP_PORT: Number(process.env.SMTP_PORT!),
  SMTP_HOST: process.env.SMTP_HOST!,
  PRIVATE_KEY: process.env.PRIVATE_KEY!,
  RPC_URL: process.env.RPC_URL!,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  PINATA_JWT: process.env.PINATA_JWT!,
};

// Validate that all environment variables are set
Object.entries(secrets).forEach(([key, value]) => {
  if (value === undefined || value === "") {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
});

console.log("🔐 Environment variables loaded.");
export default secrets;
