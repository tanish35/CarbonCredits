import { RegisterForm } from "@/components/auth/registerForm";
import { Logo } from "@/components/Logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Leaf, ShieldCheck, Wallet, Flame } from "lucide-react";

export const RegisterPage = () =>{
  
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90 z-10" />
        <img
          src="https://news.mit.edu/sites/default/files/images/202402/MIT_Carbon-Credits-Explainer-01.jpg"
          alt="Carbon credits visualization"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-20 flex flex-col h-full p-16 my-2">
          <div className="mb-auto">
            <h2 className="text-3xl font-bold mb-8 text-white">
              About EcoX
            </h2>
            <div className="grid gap-5">
              <FeatureItem
                icon={<ShieldCheck className="h-5 w-5" />}
                title="NFT-Backed Carbon Credits"
                description="Each carbon credit is uniquely tokenized as an NFT, ensuring authenticity and transparent ownership on the blockchain."
              />
              <FeatureItem
                icon={<Wallet className="h-5 w-5" />}
                title="Seamless Trading Platform"
                description="Buy, sell, and trade carbon credits instantly through our secure NFT marketplace built specifically for environmental assets."
              />
              <FeatureItem
                icon={<Leaf className="h-5 w-5" />}
                title="Real Environmental Impact"
                description="Every NFT represents a verified carbon credit that directly contributes to reducing global carbon emissions."
              />
              <FeatureItem
                icon={<Flame className="h-5 w-5" />}
                title="Rewards for Unused Tokens"
                description="Earn rewards for burning your tokens, contributing directly to environmental benefits and reducing carbon footprints."
              />
            </div>
          </div>
          <div className="mt-auto max-w-[520px]">
            <h2 className="text-4xl font-bold mb-2 leading-tight bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              Pioneer the Green Economy
            </h2>
            <p className="text-xl text-white leading-relaxed">
              Join the first NFT marketplace dedicated to verified carbon
              credits. Trade with confidence knowing each token represents real
              environmental action. Our carbon credits are tokenized as NFTs, ensuring authenticity and transparent ownership.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col p-8 md:p-12 bg-background">
        <div className="flex items-center justify-between">
          <Logo />
          <ModeToggle />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[420px] mx-auto w-full">
          <RegisterForm />
        </div>

        <p className="text-sm text-muted-foreground/80 text-center">
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
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 p-3 bg-emerald-500/20 rounded-full text-emerald-400 ring-1 ring-emerald-500/40">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-base text-emerald-100/90 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
