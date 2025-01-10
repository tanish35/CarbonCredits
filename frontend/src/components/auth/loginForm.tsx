import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      const result = await signInWithPopup(auth, googleProvider); // Google login via popup
      const user = result.user;

      // Send the user data to the backend if needed
      await api.post(
        "/user/google",
        {
          email: user.email,
          name: user.displayName,
        },
        {
          withCredentials: true,
        }
      );

      toast({
        title: "Success",
        description: "Logged in with Google successfully",
      });
      navigate("/"); // Redirect after successful login
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Error",
        description: "Failed to login with Google",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = loginSchema.safeParse(formData);

      if (!validatedData.success) {
        const errorMessages = validatedData.error.errors
          .map((err) => `${err.path.join(".")} - ${err.message}`)
          .join(", ");
        throw new Error(errorMessages);
      }

      await api.post("/user/login", formData);

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   try {
  //     setIsSubmitting(true);
  //     await signInWithRedirect(auth, googleProvider);
  //   } catch (error) {
  //     console.error("Google sign-in error:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to initiate Google login",
  //       variant: "destructive",
  //     });
  //     setIsSubmitting(false);
  //   }
  // };

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
            value={formData.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={handleEmailLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Login"}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          type="button"
        >
          <FcGoogle className="mr-2" />
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
