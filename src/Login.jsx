import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    login(role);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-80 text-center">
        <h2 className="text-2xl font-bold mb-6">Login as</h2>

        <button
          className="w-full mb-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => handleLogin("student")}
        >
          Student
        </button>

        <button
          className="w-full mb-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => handleLogin("faculty")}
        >
          Faculty
        </button>

        <button
          className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={() => handleLogin("admin")}
        >
          Admin
        </button>
      </div>
    </div>
  );
};

export default Login;