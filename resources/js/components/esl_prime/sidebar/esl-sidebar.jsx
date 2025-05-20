import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./esl-sidebar.css";
import logo from "@assets/system-logo.png";
import eiemanagementicon from "@assets/eie-management-icon.png";
import reporticon from "@assets/report-icon.png";
import dashboardiconwhite from "@assets/dashboard-icon.png";
import eiediagnosticicon from "@assets/eie-diagnostic-icon.png";
import accountIcon from "@assets/Users.png";
import certificationIcon from "@assets/certification-icon.png";
import templateIcon from "@assets/Template.png";
import epgfVersionIcon from "@assets/epgf-version-icon.png";
import interviewIcon from "@assets/InterviewScorecard.png";
import diagnosticReportsIcon from "@assets/EIEDiagnosticReports.png";
import uncLogo from "@assets/unc-logo.png";
import implementingSubjectIcon from "@assets/implementing-subject-icon.png";
import assignPOC from "@assets/assign-poc.png";
import graduating from "@assets/graduating.png";

const ESLSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Track the active page based on the route
  const [activePage, setActivePage] = useState(location.pathname);

  // Keep sections open if the activePage belongs to them
  const [showManagementButtons, setShowManagementButtons] = useState(false);
  const [showDiagnosticsButtons, setShowDiagnosticsButtons] = useState(false);

  useEffect(() => {
    setShowManagementButtons(
      ["/esl-epgf-versioning", "/esl-certification", "/esl-template", "/esl-account-management", "/esl-implementing-subjects", "/esl-assign-poc"].includes(activePage)
    );
    setShowDiagnosticsButtons(
      ["/esl-interview-scorecard", "/esl-diagnostic-reports"].includes(activePage)
    );
  }, [activePage]);

  // Handle navigation and set active state
  const handleNavigation = (path) => {
    setActivePage(path);
    navigate(path);
  };

  return (
    <div className="esl-dashboard-sidebar">
    <div className="esl-dashboard-logo-title">
    <img src={logo} alt="EIEPIMS Logo" className="logo" />
    <div className="title-container">
    <h1 className="title">
    <span className="eie-text">EIE</span>PIMS
    </h1>
    <p className="sub-title">PROGRAM IMPLEMENTATION <br /> MANAGEMENT SYSTEM</p>
    </div>
    </div>


    <div className="esl-prime-pages">
    {/* Dashboard */}
    <button
    className={`esl-dashboard-sidebar-button ${activePage === "/esl-dashboard" ? "active" : ""}`}
    onClick={() => handleNavigation("/esl-dashboard")}
    >
    <img src={dashboardiconwhite} alt="Dashboard icon" className="esl-dashboard-icon" />
    <p>Dashboard</p>
    </button>

    {/* EIE Reporting */}
    <button
    className={`esl-eie-reporting-sidebar-button ${activePage === "/esl-eie-reporting" ? "active" : ""}`}
    onClick={() => handleNavigation("/esl-eie-reporting")}
    >
    <img src={reporticon} alt="EIE Reporting icon" className="class-icon" />
    <p>EIE Reports</p>
    </button>

    {/* EIE Diagnostics */}
    <button
    className={`esl-eie-diagnostic-sidebar-button ${showDiagnosticsButtons ? "active" : ""}`}
    onClick={() => setShowDiagnosticsButtons(!showDiagnosticsButtons)}
    >
    <img src={eiediagnosticicon} alt="EIE Diagnostics icon" className="report-icon" />
    <p>EIE Diagnostics</p>
    </button>

    {/* 🔸 EIE Diagnostics Sub-menu */}
    {showDiagnosticsButtons && (
      <div className="extra-buttons-container">
      <button
      className={`interview-button ${activePage === "/esl-interview-scorecard" ? "active" : ""}`}
      onClick={() => handleNavigation("/esl-interview-scorecard")}
      >
      <img src={interviewIcon} alt="Interview Scorecard Icon" />
      <p>Interview Scorecard</p>
      </button>
      <button
      className={`diagnosticReports-button ${activePage === "/esl-diagnostic-reports" ? "active" : ""}`}
      onClick={() => handleNavigation("/esl-diagnostic-reports")}
      >
      <img src={diagnosticReportsIcon} alt="Diagnostics Reports Icon" />
      <p>Diagnostics Reports</p>
      </button>
      </div>
    )}

    {/* EIE Management */}
    <button
    className={`esl-eie-management-sidebar-button ${showManagementButtons ? "active" : ""}`}
    onClick={() => setShowManagementButtons(!showManagementButtons)}
    >
    <img src={eiemanagementicon} alt="EIE Management icon" className="student-icon" />
    <p>EIE Management</p>
    </button>

    {/* 🔸 EIE Management Sub-menu */}
    {showManagementButtons && (
      <div className="extra-buttons-container">
      <button
      className={`esl-imp-subjects-button ${activePage === "/esl-implementing-subjects" ? "active" : ""}`}
      onClick={() => handleNavigation("/esl-implementing-subjects")}
      >
      <img src={implementingSubjectIcon} alt="Implementing Subjects Icon" />
      <p>Implementing Subjects</p>
      </button>
      {/* Assign POC Button */}
      <button
      className={`esl-assign-poc-sidebar-button ${activePage === "/esl-assign-poc" ? "active" : ""}`}
      onClick={() => handleNavigation("/esl-assign-poc")}
      >
      <img src={assignPOC} alt="Assign POC icon" className="class-icon" />
      <p>Assign POC</p>
      </button>
      <button
      className={`epgf-rubric-button ${activePage === "/esl-epgf-versioning" ? "active" : ""}`}
      onClick={() => handleNavigation("/esl-epgf-versioning")}
      >
      <img src={epgfVersionIcon} alt="EPGF Rubric Icon" />
      <p>EPGF Rubric</p>
      </button>
      <button
      className={`certification-button ${activePage === "/esl-certification" ? "active" : ""}`}
      onClick={() => handleNavigation("/esl-certification")}
      >
      <img src={certificationIcon} alt="Certification Icon" />
      <p>Certification</p>
      </button>
      <button
      className={`monthly-champions-button ${activePage === "/esl-template" ? "active" : ""}`}
      onClick={() => handleNavigation("/esl-template")}
      >
      <img src={templateIcon} alt="Template Icon" />
      <p>Template</p>
      </button>
      <button
      className={`accounts-button ${activePage === "/esl-account-management" ? "active" : ""}`}
      onClick={() => handleNavigation("/esl-account-management")}
      >
      <img src={accountIcon} alt="Accounts Icon" />
      <p>Accounts</p>
      </button>
      </div>
    )}
    </div>
    {/* UNC Logo and University Name */}
    <div className="unc-branding">
    <img src={uncLogo} alt="UNC Logo" className="unc-logo" />
    <p className="unc-text">University of Nueva Caceres</p>
    </div>
    </div>
  );
};

export default ESLSidebar;
