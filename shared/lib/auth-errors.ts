import { CredentialsSignin } from "next-auth";

// Handling custom authentication error for unverified email accounts
export class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}
