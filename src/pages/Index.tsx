import Header from "@/components/Header";
import Hero from "@/components/Hero";

const Index = () => {
  const currentUser = {
    name: "John Doe",
    role: "student" as const
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} />
      <Hero />
    </div>
  );
};

export default Index;
