import { SignUpForm } from "@/components/sign-up-form";
import AuthWrapper from "@/app/auth-wrapper";
// import { clearSession } from "@/lib/session";

export default function Page() {
  return (
    // <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    //   <div className="w-full max-w-sm">
        <AuthWrapper><SignUpForm /></AuthWrapper>
    //   {/* </div>
    // </div> */}
  );
}
