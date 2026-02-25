import { useAuth } from "../context/AuthContext";
import EmployeeDashboard from "../components/EmployeeDashboard";
import ManagerDashboard from "../components/ManagerDashboard";
import AdminDashboard from "../components/AdminDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      {user.role === "Employee" ? (
        <EmployeeDashboard />
      ) : user.role === "Manager" ? (
        <ManagerDashboard />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
};

export default Dashboard;
