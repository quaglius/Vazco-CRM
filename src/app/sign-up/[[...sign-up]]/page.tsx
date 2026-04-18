import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { isAuthEnabled } from "@/lib/auth-config";

export default function SignUpPage() {
  if (!isAuthEnabled()) {
    redirect("/");
  }

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center p-4">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
