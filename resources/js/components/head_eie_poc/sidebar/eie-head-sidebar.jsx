import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./eie-head-sidebar.css";

import logo from "@assets/system-logo.png";
import reporticon from "@assets/report-icon.png";
import studentmanagementicon from "@assets/student-management.png";
import dashboardiconwhite from "@assets/dashboard-icon.png";
import implementingSubjectIcon from "@assets/implementing-subject-icon.png";
import masterClassListIcon from "@assets/master-class-list-icon.png";
import uncLogo from "@assets/unc-logo.png";
import assignPOC from "@assets/assign-poc.png";
import graduating from "@assets/graduating.png";
import diagnosticReportsIcon from "@assets/EIEDiagnosticReports.png";
import champIcon from "@assets/champion-icon.png";

const CollegePOCSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePage, setActivePage] = useState(location.pathname);
  const [showStudentSubmenu, setShowStudentSubmenu] = useState(false);

  const handleNavigation = (path) => {
    setActivePage(path);
    navigate(path);
  };

  const handleStudentManagementClick = () => {
    setShowStudentSubmenu(!showStudentSubmenu);
    handleNavigation("/eie-head-student-management");
  };

  useEffect(() => {
    // Automatically expand submenu if its child pages are active
    setShowStudentSubmenu(
      ["/eie-head-student-management", "/eie-head-master-class-list", "/eie-head-graduating-list", "/eie-head-champion-selection"].includes(location.pathname)
    );
    setActivePage(location.pathname);
  }, [location.pathname]);

  return (
    <div className="eie-head-dashboard-sidebar">
    {/* Logo + Title */}
    <div className="eie-head-dashboard-logo-title">
    <img src={logo} alt="EIEPIMS Logo" className="logo" />
    <div className="title-container">
    <h1 className="title">
    <span className="eie-text">EIE</span>PIMS
    </h1>
    <p className="sub-title">
    PROGRAM IMPLEMENTATION <br /> MANAGEMENT SYSTEM
    </p>
    </div>
    </div>

    {/* Sidebar Menu */}
    <div className="eie-head-pages">
    {/* Dashboard */}
    <button
    className={`eie-head-dashboard-sidebar-button ${activePage === "/eie-head-poc-dashboard" ? "active" : ""}`}
    onClick={() => handleNavigation("/eie-head-poc-dashboard")}
    >
    <img src={dashboardiconwhite} alt="Dashboard icon" className="eie-head-dashboard-icon" />
    <p>Dashboard</p>
    </button>

    {/* Implementing Subjects */}
    <button
    className={`eie-head-implementing-subject-sidebar-button ${activePage === "/implementing-subjects" ? "active" : ""}`}
    onClick={() => handleNavigation("/implementing-subjects")}
    >
    <img src={implementingSubjectIcon} alt="Implementing icon" className="class-icon" />
    <p>Implementing Subjects</p>
    </button>

    {/* Assign POC */}
    <button
    className={`eie-head-implementing-subject-sidebar-button ${activePage === "/eie-head-assign-poc" ? "active" : ""}`}
    onClick={() => handleNavigation("/eie-head-assign-poc")}
    >
    <img src={assignPOC} alt="Implementing icon" className="class-icon" />
    <p>Assign POC</p>
    </button>

    {/* Student Management (navigates and toggles submenu) */}
    <button
    className={`eie-head-student-management-sidebar-button ${[
      "/eie-head-student-management",
      "/eie-head-master-class-list",
      "/eie-head-graduating-list",
      "/eie-head-champion-selection",
    ].includes(activePage)
    ? "active"
    : ""}`}
    onClick={handleStudentManagementClick}
    >
    <img src={studentmanagementicon} alt="Student Management icon" className="student-manage-icon" />
    <p>Student Management</p>
    </button>

    {/* Submenu: Master Class List & Graduating List */}
    {showStudentSubmenu && (
      <div className="eie-head-extra-buttons-container">
      <button
      className={`eie-head-master-class-list-sidebar-button ${activePage === "/eie-head-master-class-list" ? "active" : ""}`}
      onClick={() => handleNavigation("/eie-head-master-class-list")}
      >
      <img src={masterClassListIcon} alt="Master Class List icon" className="master-class-icon" />
      <p>Master Class List</p>
      </button>
      <button
      className={`eie-head-master-class-list-sidebar-button ${activePage === "/eie-head-graduating-list" ? "active" : ""}`}
      onClick={() => handleNavigation("/eie-head-graduating-list")}
      >
      <img src={graduating} alt="Graduating List icon" className="master-class-icon" />
      <p>Graduating List</p>
      </button>
      <button
      className={`eie-head-master-class-list-sidebar-button ${activePage === "/eie-head-champion-selection" ? "active" : ""}`}
      onClick={() => handleNavigation("/eie-head-champion-selection")}
      >
      <img src={champIcon} alt="Champion icon" className="master-class-icon" />
      <p>Select Champion</p>
      </button>
      </div>
    )}

    {/* EIE Reporting */}
    <button
    className={`eie-head-eie-reporting-sidebar-button ${activePage === "/eie-head-reporting" ? "active" : ""}`}
    onClick={() => handleNavigation("/eie-head-reporting")}
    >
    <img src={reporticon} alt="EIE reporting icon" className="report-icon" />
    <p>EIE Reports</p>
    </button>
    </div>

    <button
    className={`eie-head-diagnosticReports-button ${activePage === "/eie-head-diagnostic-report" ? "active" : ""}`}
    onClick={() => handleNavigation("/eie-head-diagnostic-report")}
    >
    <img src={diagnosticReportsIcon} alt="Diagnostics Reports Icon" />
    <p>Diagnostics Reports</p>
    </button>

    {/* Footer Branding */}
    <div className="unc-branding">
    <img src={uncLogo} alt="UNC Logo" className="unc-logo" />
    <p className="unc-text">University of Nueva Caceres</p>
    </div>
    </div>
  );
};

export default CollegePOCSidebar;
