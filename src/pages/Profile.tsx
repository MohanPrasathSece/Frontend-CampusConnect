import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold">Profile</h2>
        <div className="p-6 rounded-lg border bg-card shadow-sm w-full max-w-md">
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">Name</p>
              <p className="text-lg font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Role</p>
              <p className="text-lg font-medium capitalize text-foreground">{user.role}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">ID</p>
              <p className="text-lg font-mono text-foreground break-all">{user.id}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Profile;
