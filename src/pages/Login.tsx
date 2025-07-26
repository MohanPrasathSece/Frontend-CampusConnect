import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/auth/login", data);
      login(res.data.token);
      toast({ title: "Welcome back!" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.response?.data?.message || "Unknown error", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Email" {...register("email")}/>
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          <Input type="password" placeholder="Password" {...register("password")}/>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          <Button className="w-full" disabled={isSubmitting}>Login</Button>
        </form>
        <p className="text-sm text-center">Don't have an account? <Link className="underline" to="/signup">Sign up</Link></p>
      </Card>
    </div>
  );
};

export default Login;
