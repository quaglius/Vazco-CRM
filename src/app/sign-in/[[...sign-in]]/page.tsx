import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { isAuthEnabled } from "@/lib/auth-config";

export default function SignInPage() {
  if (!isAuthEnabled()) {
    redirect("/");
  }

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center p-4">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
