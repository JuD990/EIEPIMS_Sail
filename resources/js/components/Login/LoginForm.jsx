import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/LoginForm.css";
import uncLogo from "@assets/unc-logo.png";
import systemLogo from "@assets/system-logo.png";
import userIcon from "@assets/user.png";
import eyeIcon from "@assets/eye-icon.png";
import eyeOffIcon from "@assets/eye-off-icon.png";
import dropdownLogo from "@assets/dropdown-logo-login.png";
import loginBGimage from "@assets/login-bg-image.png";
import apiService from "@services/apiServices";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getCsrfToken = async () => {
    try {
      await apiService.get("/sanctum/csrf-cookie");
    } catch (err) {
      console.error("CSRF token fetch error:", err);
      setError("Failed to fetch CSRF token. Please try again.");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password || !userType) {
      setError("Please enter all the credentials.");
      return;
    }

    const userTypeToTableMap = {
      "Student": "students",
      "College POC": "college_pocs",
      "Lead EIE POC": "lead_pocs",
      "Head EIE POC": "eie_heads",
      "ESL Prime": "esl_prime",
      "ESL Champion": "esl_champion",
    };

    const roleKeyMap = {
      "Student": "student",
      "College POC": "college_poc",
      "Lead EIE POC": "lead_eie_poc",
      "Head EIE POC": "eie_head_poc",
      "ESL Prime": "esl_prime",
      "ESL Champion": "esl_champion",
    };

    const table = userTypeToTableMap[userType];
    const roleKey = roleKeyMap[userType];

    if (!table || !roleKey) {
      setError("Invalid user type selected.");
      return;
    }

    try {
      await getCsrfToken();

      const response = await apiService.post("/login", {
        email: `${email}@unc.edu.ph`,
        password,
        user_type: table,
      });

      if (response.status === 200) {
        const { token, employee_id, student_id } = response.data;

        if (!employee_id && !student_id) {
          setError("Employee ID or Student ID not found in the response.");
          return;
        }

        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", roleKey);
        localStorage.setItem("userType", userType);

        if (roleKey === "student" && student_id) {
          localStorage.setItem("student_id", student_id);
        } else if (employee_id) {
          localStorage.setItem("employee_id", employee_id);
        }

        try {
          await apiService.post("/eie-reports/store-or-update");
        } catch (reportError) {
          console.error("Failed to update EIE Reports:", reportError);
        }

        switch (roleKey) {
          case "student":
            navigate("/student-dashboard");
            break;
          case "college_poc":
            navigate("/college-poc-dashboard");
            break;
          case "lead_eie_poc":
            navigate("/lead-eie-poc-dashboard");
            break;
          case "eie_head_poc":
            navigate("/eie-head-poc-dashboard");
            break;
          case "esl_prime":
            navigate("/esl-dashboard");
            break;
          case "esl_champion":
            navigate("/esl-dashboard");
            break;
          default:
            navigate("/");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError("Invalid credentials. Please try again.");
            break;
          case 404:
            setError("User not found.");
            break;
          case 405:
            setError("Invalid request method.");
            break;
          case 500:
            setError("Internal server error.");
            break;
          default:
            setError("An unexpected error occurred.");
        }
      } else if (error.request) {
        setError("No response from server.");
      } else {
        setError("Error: " + error.message);
      }
    }
  };

  return (
    <div
    className="login-container"
    style={{
      backgroundImage: `url(${loginBGimage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
    }}
    >
    <div className="login-logos">
    <img className="login-unc-logo" src={uncLogo} alt="UNC Logo" />
    <img className="login-system-logo" src={systemLogo} alt="System Logo" />
    </div>

    <h1 className="login-main-title">
    <span className="login-eie" title="English Immersive Environment">
    EIE
    </span>
    <span className="login-pims">Program Implementation Management System</span>
    </h1>

    <h2 className="login-subtitle">Please enter your credentials</h2>

    <form className="login-form" onSubmit={handleLogin}>
    {error && <div className="login-error-message">{error}</div>}

    <div className="login-form-group login-dropdown-container">
    <label className="login-form-label">Login As:</label>
    <select
    className="login-dropdown"
    value={userType}
    onChange={(e) => setUserType(e.target.value)}
    >
    <option value="Student">Student</option>
    <option value="College POC">College POC</option>
    <option value="Lead EIE POC">Lead EIE POC</option>
    <option value="Head EIE POC">Head EIE POC</option>
    <option value="ESL Prime">ESL Prime</option>
    <option value="ESL Champion">ESL Champion</option>
    </select>
    <img className="login-dropdown-logo" src={dropdownLogo} alt="Dropdown Logo" />
    </div>

    <div className="login-form-group login-email-input-container">
    <label className="login-email-form-label">Email:</label>
    <input
    type=""
    className="login-email-input"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    />
    <div className="login-email-domain">
    <span>@unc.edu.ph</span>
    <img className="login-user-icon" src={userIcon} alt="User Icon" />
    </div>
    </div>

    <div className="login-form-group login-password-input-container">
    <label className="login-password-form-label">Password:</label>
    <div className="login-password-input-wrapper">
    <input
    type={showPassword ? "" : "password"}
    className="login-password-input"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    />
    <img
    className="login-toggle-password-icon"
    src={showPassword ? eyeOffIcon : eyeIcon}
    alt="Toggle Password"
    onClick={() => setShowPassword(!showPassword)}
    />
    </div>
    </div>

    <div className="login-forgot-password-container">
    <div className="login-forgot-password"></div>
    <button className="login-button" type="submit">
    Login
    </button>
    </div>
    </form>
    </div>
  );
};

export default LoginForm;
