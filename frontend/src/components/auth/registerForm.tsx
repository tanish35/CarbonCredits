import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { registrationSchema } from "@/validators/auth.validator";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth, googleProvider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import { api } from "@/lib/api";

export const RegisterForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [inputText, setInputText] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phNumber: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputText((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      setIsSubmitting(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
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
      navigate("/");
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

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    //zod validation
    const result = registrationSchema.safeParse(inputText);
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
      const user = await axios.post(
        "/user/register",
        {
          email: inputText.email,
          password: inputText.password,
          name: inputText.name,
          address: inputText.address,
          phone: inputText.phNumber,
        },
        {
          withCredentials: true,
        }
      );
      if (user) {
        toast({
          title: "Success",
          description: "Registered successfully",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create an account
          </h1>
          <p className="text-base text-muted-foreground">
            Join us and start trading carbon credits today
          </p>
        </div>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            name="name"
            placeholder="Elon Musk"
            value={inputText.name}
            onChange={handleChange}
          />
        </div>
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            value={inputText.password}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Password"
            value={inputText.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Phone Number</Label>
          <Input
            id="phNumber"
            type="text"
            name="phNumber"
            placeholder="+123456789"
            value={inputText.phNumber}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Address</Label>
          <Input
            id="Address"
            type="text"
            name="address"
            placeholder="Address"
            value={inputText.address}
            onChange={handleChange}
          />
        </div>
        <Button type="button" className="w-full" onClick={handleSubmit}>
          {isSubmitting ? <Loader2 /> : "Create Account"}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={(e) => {
            handleGoogleLogin(e);
          }}
        >
          Sign up with Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Log in
        </a>
      </div>
    </form>
  );
};
