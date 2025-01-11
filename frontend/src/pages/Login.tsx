import { LoginForm } from "@/components/auth/loginForm";
// import { Loader } from "@/components/Loader";
import { Logo } from "@/components/Logo";
import { ModeToggle } from "@/components/mode-toggle";

export const LoginPage = () => {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col p-8 md:p-12 bg-background">
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <ModeToggle />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col justify-center max-w-[420px] mx-auto w-full">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-12 text-sm text-muted-foreground/80 text-center">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Image Section */}
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 z-10" />
        <img
          src="https://news.mit.edu/sites/default/files/images/202402/MIT_Carbon-Credits-Explainer-01.jpg"
          alt="Carbon credits visualization"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-20 flex flex-col h-full p-16 text-white">
          <div className="mt-auto max-w-[520px]">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Make a Positive Impact
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Trade verified carbon credits and contribute to a sustainable
              future
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
