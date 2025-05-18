import React, { useState, useEffect, useRef, useCallback } from "react";
import "./User-info.css";
import apiService from "@services/apiServices";
import { useNavigate } from "react-router-dom";
import LogoutButton from "@logout/Logout";
import logoutIcon from "@assets/logout_icon.png";
import profileIcon from "@assets/profile.png";
import bcrypt from "bcryptjs";
import axios from 'axios';
import defaultProfile from "@profilePics/default_logo.png";

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);

  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [file, setFile] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Authentication token not found.");

        setToken(token); // Store token in state

        const response = await apiService.get("/user-info", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
        const roleBasedId =
        response.data.role === "Student"
        ? response.data.student_id
        : response.data.employee_id;

        setUserId(roleBasedId);
        setRole(response.data.role);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/"); // Redirect to login page if token is invalid
        } else {
          setError(err.response?.data?.message || "Failed to fetch user info.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  useEffect(() => {
    if (!role || !userId) return;

    const fetchUserDetails = async () => {
      try {
        const response = await apiService.get("/get-user", {
          params: {
            role,
            student_id: role === "Student" ? userId : null,
            employee_id: role !== "Student" ? userId : null,
          },
        });
        setUser(response.data.data);
      } catch (err) {
        console.error("Error fetching detailed user info:", err);
      }
    };

    fetchUserDetails();
  }, [role, userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateCurrentPassword = useCallback(
    async (inputPassword, newPassword) => {
      if (!user) return false;

      try {
        const trimmedInput = inputPassword.trim();
        const trimmedNewPassword = newPassword?.trim();
        const idToMatch = String(role === "Student" ? user.student_id : user.employee_id);
        let passwordMatches = false;

        if (!user.password) {
          // No password set — fallback to ID as default password
          passwordMatches = trimmedInput === idToMatch;
        } else {
          // Password exists — must match bcrypt hash
          passwordMatches = await bcrypt.compare(trimmedInput, user.password);
        }

        if (passwordMatches) {
          // Prevent using same as current password or student/employee ID
          if (trimmedInput === trimmedNewPassword || trimmedNewPassword === idToMatch) {
            setPasswordError("Same as current password. Pick a new one!");
            return false;
          }

          setPasswordError("");
          return true;
        } else {
          setPasswordError("Incorrect password or ID.");
          return false;
        }
      } catch (error) {
        console.error("Error validating password:", error);
        setPasswordError("Something went wrong during verification.");
        return false;
      }
    },
    [user, role]
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Check if current password is provided and valid
    if (newPassword) {
      const passwordIsValid = await validateCurrentPassword(currentPassword, newPassword);
      if (!passwordIsValid) return;

      if (newPassword !== confirmPassword) {
        setPasswordError("New passwords do not match.");
        return;
      }
    }

    setPasswordError(""); // Clear any lingering errors before submitting

    // Prepare the updated user data
    const updatedUserData = {
      firstname: user.firstname,
      middlename: user.middlename,
      lastname: user.lastname,
      email: user.email,
      password: newPassword?.trim() || "",
      role,
      employee_id: user.employee_id,
      student_id: user.student_id,
    };

    try {
      const response = await apiService.put("/update-user", updatedUserData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUser(response.data); // Update local state
      }
    } catch (error) {
      console.error("Error updating user info:", error.response?.data?.message || error.message);
      setError("Failed to update user info.");
      return;
    }

    // Handle profile picture upload if any
    if (selectedFile) {
      if (selectedFile.type !== "image/png") {
        alert("Invalid file type. Please upload a PNG image.");
        return;
      }

      if (selectedFile.size > 2 * 1024 * 1024) {
        alert("File size exceeds the 2MB limit.");
        return;
      }

      const formData = new FormData();
      formData.append("profile_picture", selectedFile);
      formData.append("employee_id", user.employee_id);
      formData.append("student_id", user.student_id);

      try {
        const response = await axios.post(
          "http://localhost:8000/api/upload-profile-picture",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          location.reload(); // Optional: refresh to reflect changes
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error.response?.data?.message || error.message);
        return;
      }
    }

    closeModal(); // Close modal after everything is done
  };

  useEffect(() => {
    setIsPasswordMatch(newPassword === confirmPassword || !confirmPassword);
  }, [newPassword, confirmPassword]);

  const closeModal = () => {
    setShowProfileModal(false);
  };

  const profilePicture = userId
  ? `/assets/user_profile_pics/${userId}.png`
  : '/assets/user_profile_pics/default_logo.png';

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (

    <div className="user-info" ref={dropdownRef} onClick={() => setDropdownOpen((prev) => !prev)}>
    <div className="user-icon">
    <img
    src={profilePicture}
    alt="Profile"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = defaultProfile;
    }}
    />
    </div>
    <div className="user-details">
    <h2 className="user-name">{user.firstname} {user.lastname}</h2>
    <p className="user-role">
    {[user.department, user.role, user.year_level].filter(Boolean).join(" ").toUpperCase()}
    </p>
    </div>

    {dropdownOpen && (
      <div className="user-info-dropdown-menu">
      <button onClick={() => setShowProfileModal(true)} className="user-info-dropdown-item">
      <img src={profileIcon} alt="Profile Icon" className="profile-dropdown-icon" />
      Profile
      </button>
      <div className="logout-user-info-dropdown-item">
      <img src={logoutIcon} alt="Logout Icon" className="logout-dropdown-icon" />
      <LogoutButton />
      </div>
      </div>
    )}

    {showProfileModal && (
      <div className="student-modal-overlay" onClick={closeModal}>
      <div className="student-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
      <h2>Update Profile</h2>
      <img src={profileIcon} alt="Profile Icon" className="profile-dropdown-icon2" />
      </div>
      <form onSubmit={handleFormSubmit}>
      <label>
      First Name:
      <input
      type="text"
      value={user.firstname || ""}
      onChange={(e) => setUser({ ...user, firstname: e.target.value })}
      disabled
      />
      </label>

      <label>
      Middle Name:
      <input
      type="text"
      value={user.middlename || ""}
      onChange={(e) => setUser({ ...user, middlename: e.target.value })}
      disabled
      />
      </label>

      <label>
      Last Name:
      <input
      type="text"
      value={user.lastname || ""}
      onChange={(e) => setUser({ ...user, lastname: e.target.value })}
      disabled
      />
      </label>

      <label>
      Email:
      <input
      type="email"
      value={user.email || ""}
      onChange={(e) => setUser({ ...user, email: e.target.value })}
      disabled
      />
      </label>
      <label>
      Profile Picture:
      <input
      type="file"
      accept="image/png"
      onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      </label>

      {/* Current Password */}
      <label className="password-label">
      <div className="label-text-container">
      <div className="label-text">Current Password:</div>
      <span
      className="show-hide-toggle"
      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
      >
      {showCurrentPassword ? "Hide" : "Show"}
      </span>
      </div>
      <div className="password-input-container">
      <input
      type={showCurrentPassword ? "text" : "password"}
      className={
        passwordError === "Incorrect password or ID." ? "error" : ""
      }
      value={currentPassword}
      onChange={(e) => {
        const input = e.target.value;
        setCurrentPassword(input);
        if (input) {
          validateCurrentPassword(input, newPassword);
        } else {
          setPasswordError("");
        }
      }}
      placeholder="Enter current password (optional)"
      />
      </div>
      {passwordError === "Incorrect password or ID." && (
        <p className="student-password-error">{passwordError}</p>
      )}
      </label>

      {/* New Password */}
      <label className="password-label">
      <div className="label-text-container">
      <div className="label-text">New Password:</div>
      <span
      className="show-hide-toggle"
      onClick={() => setShowNewPassword(!showNewPassword)}
      >
      {showNewPassword ? "Hide" : "Show"}
      </span>
      </div>
      <div className="password-input-container">
      <input
      type={showNewPassword ? "text" : "password"}
      className={
        passwordError === "Same as current password. Pick a new one!" ? "error" : ""
      }
      value={newPassword}
      onChange={(e) => {
        const input = e.target.value;
        setNewPassword(input);
        if (input) {
          validateCurrentPassword(currentPassword, input);
        } else {
          setPasswordError("");
        }

        // Also check if confirmation still matches
        setIsPasswordMatch(input === confirmPassword || !confirmPassword);
      }}
      placeholder="Enter new password (optional)"
      />
      </div>
      {passwordError === "Same as current password. Pick a new one!" && (
        <p className="student-password-error">{passwordError}</p>
      )}
      </label>

      {/* Confirm New Password */}
      <label className="password-label">
      <div className="label-text-container">
      <div className="label-text">Confirm New Password:</div>
      <span
      className="show-hide-toggle"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      >
      {showConfirmPassword ? "Hide" : "Show"}
      </span>
      </div>
      <div className="password-input-container">
      <input
      type={showConfirmPassword ? "text" : "password"}
      className={!isPasswordMatch ? "error" : ""}
      value={confirmPassword}
      onChange={(e) => {
        const input = e.target.value;
        setConfirmPassword(input);
        setIsPasswordMatch(newPassword === input || !input);
      }}
      placeholder="Confirm new password (optional)"
      />
      </div>
      {!isPasswordMatch && confirmPassword && (
        <p className="student-password-error">Passwords do not match.</p>
      )}
      </label>

      {/* General Error (if any other message is set) */}
      {passwordError &&
        passwordError !== "Incorrect password or ID." &&
        passwordError !== "Same as current password. Pick a new one!" && (
          <p className="student-password-error">{passwordError}</p>
        )}

        <div className="student-modal-buttons">
        <button type="button" onClick={closeModal} className="student-cancel-button">
        Cancel
        </button>
        <button
        type="submit"
        className="student-update-button"
        >
        Update
        </button>
        </div>
        </form>
        </div>
        </div>
    )}
    </div>
  );
};

export default UserInfo;
