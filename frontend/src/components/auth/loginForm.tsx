import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { api } from "@/lib/api";
import { loginSchema } from "@/validators/auth.validator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputText((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    //zod validation
    const result = loginSchema.safeParse(inputText);
    if (!result.success) {
      const errorMessages = result.error.errors
        .map((err) => `${err.path.join(".")} - ${err.message}`)
        .join(", ");
      toast({
        title: "Error",
        description: errorMessages,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    console.log(inputText);
    //api call
    try {
      const user = await api.post("/user/login", inputText);
      if (user) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        console.log(user.data);
        navigate("/");
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await signInWithPopup(auth, googleProvider);
    const response = await axios.post("/api/user/google", {
      email: result.user.email,
      name: result.user.displayName,
    }, {
      withCredentials: true,
    }
  );
    console.log(response.data);
    setIsSubmitting(false);
    navigate("/");
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-base text-muted-foreground">
            Log in to manage your carbon credits and impact
          </p>
        </div>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="elon@x.com"
            value={inputText.email}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href=""
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            value={inputText.password}
            onChange={handleChange}
          />
        </div>
        <Button type="button" className="w-full" onClick={handleSubmit}>
          {isSubmitting ? <Loader2 /> : "Login"}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={(e) => handleGoogleLogin(e)}
        >
          <FcGoogle />
          Login with Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <Link to="/register" className="underline underline-offset-4">
          Create Account
        </Link>
      </div>
    </form>
  );
}
