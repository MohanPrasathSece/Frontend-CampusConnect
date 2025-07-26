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
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "admin"])
});

type FormData = z.infer<typeof schema>;

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: "student" } });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/auth/signup", data);
      login(res.data.token);
      toast({ title: "Account created!" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.response?.data?.message || "Unknown error", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Sign Up</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Name" {...register("name")}/>
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          <Input placeholder="Email" {...register("email")}/>
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          <Input type="password" placeholder="Password" {...register("password")} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          <select className="w-full border rounded p-2" {...register("role")}> 
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          <Button className="w-full" disabled={isSubmitting}>Create account</Button>
        </form>
        <p className="text-sm text-center">Already have an account? <Link className="underline" to="/login">Log in</Link></p>
      </Card>
    </div>
  );
};

export default Signup;
