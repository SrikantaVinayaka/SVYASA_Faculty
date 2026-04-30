import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import LessonPlan from "./components/LessonPlan/LessonPlan.jsx";
import Attendance from "./components/Attendance/Attendance";
import Timetable from "./components/Timetable/Timetable.jsx";
import Events from "./components/Event_s/Events.jsx";
import MyProfile from "./components/MyProfile/MyProfile.jsx";
import LoginPage from "./pages/LoginPage.jsx";
// import MentoringPage from "./pages/MentoringPage.jsx";
import Mentoring from "./components/Mentoring/Mentoring.jsx";
import { EventsProvider } from "./context/EventsContext.jsx";
import { useMemo, useState, useEffect } from "react";

const LESSON_PLAN_STORAGE_KEY = "svyasa.lessonPlans.v2";
const AUTH_STORAGE_KEY = "svyasa.auth.v1";

export default function App() {
  const [activeId, setActiveId] = useState("dashboard");
  const [activeChild, setActiveChild] = useState("Class Timetable");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(AUTH_STORAGE_KEY) === "1";
  });
  const [lessonPlans, setLessonPlans] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(LESSON_PLAN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Update activeChild when navigating to events
  useEffect(() => {
    if (activeId === "events" && activeChild === "Class Timetable") {
      setActiveChild("Events");
    }
  }, [activeId, activeChild]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTH_STORAGE_KEY, isAuthenticated ? "1" : "0");
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LESSON_PLAN_STORAGE_KEY, JSON.stringify(lessonPlans));
    } catch {
      // Ignore storage failures and keep in-memory state working.
    }

  }, [lessonPlans]);

  const breadcrumb = useMemo(() => {
    if (activeId === "lessonplan") return `Lesson Plan · ${activeChild}`;
    if (activeId === "attendance") return `Attendance · ${activeChild}`;
    if (activeId === "timetable") return `Timetable · ${activeChild}`;
    if (activeId === "events") return `Events · ${activeChild}`;
    if (activeId === "mentoring") return `Mentoring · ${activeChild}`;
    if (activeId === "profile") return "My Profile";
    return "My Dashboard";
  }, [activeChild, activeId]);

  function navigateTo(targetId, targetChild = "") {
    setActiveId(targetId);
    if (targetChild) setActiveChild(targetChild);
  }

  function handleLogin() {
    setIsAuthenticated(true);
    setActiveId("dashboard");
    setActiveChild("Class Timetable");
  }

  function handleLogout() {
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const unsupportedModule = (
    <main className="flex-1 overflow-y-auto p-6 pb-12">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-bold text-text">Module Under Development</h2>
        <p className="mt-2 text-[13px] text-text2">
          This page is not available yet. You can continue using Dashboard, Lesson Plan, Attendance, Timetable, Events and My Profile.
        </p>
      </div>
    </main>
  );

  return (
    <EventsProvider>
      <div className="flex h-screen overflow-hidden bg-page-bg">
        <Sidebar
          activeId={activeId}
          activeChild={activeChild}
          onActiveIdChange={setActiveId}
          onActiveChildChange={setActiveChild}
        />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Topbar breadcrumb={breadcrumb} onLogout={handleLogout} onNavigate={navigateTo} />
          {
          activeId === "lessonplan" ? (
            <LessonPlan
              tab={activeChild}
              onTabChange={setActiveChild}
              lessonPlans={lessonPlans}
              onLessonPlansChange={setLessonPlans}
            />
          ) : activeId === "attendance" ? (
            <Attendance />
          ) : activeId === "timetable" ? (
            <Timetable tab={activeChild} onTabChange={setActiveChild} />
          ) : activeId === "events" ? (
            <Events activeChild={activeChild} onActiveChildChange={setActiveChild} />
          ) : activeId === "mentoring" ? (
            <main className="flex-1 overflow-y-auto p-6 pb-12">
              <Mentoring />
            </main>
          ) : activeId === "profile" ? (
            <MyProfile />
          ) : activeId === "dashboard" ? (
            <Dashboard onNavigate={navigateTo} />
          ) : (
            unsupportedModule
          )
            
          }
        </div>
      </div>
    </EventsProvider>
  );
}
