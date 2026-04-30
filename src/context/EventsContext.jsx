import { createContext, useContext, useState } from "react";

const EventsContext = createContext();

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "International Conference on Data Science",
      type: "In-House",
      date: "2026-04-15",
      organizer: "Dr. Rajesh Kumar",
      department: "Computer Science",
      location: "Data Science Lab",
    },
    {
      id: 2,
      title: "Yoga Symposium 2026",
      type: "External",
      date: "2026-04-20",
      organizer: "Prof. Priya Sharma",
      department: "Yoga & Naturopathy",
      location: "Convention Hall A",
    },
    {
      id: 3,
      title: "Management Leadership Summit",
      type: "In-House",
      date: "2026-04-25",
      organizer: "Dr. Amit Singh",
      department: "Management Studies",
      location: "Main Auditorium",
    },
    {
      id: 4,
      title: "Workshop on AI & Machine Learning",
      type: "In-House",
      date: "2026-02-15",
      organizer: "Prof. AI Research Team",
      department: "Computer Science",
      location: "CS Lab 3",
    },
    {
      id: 5,
      title: "Industry Guest Lecture Series",
      type: "External",
      date: "2026-01-28",
      organizer: "Prof. Placement Cell",
      department: "Management Studies",
      location: "Auditorium B",
    },
    {
      id: 6,
      title: "Faculty Development Program",
      type: "In-House",
      date: "2025-12-10",
      organizer: "Dr. HR & Training",
      department: "Computer Science",
      location: "Room 101",
    },
  ]);

  const addEvent = (event) => {
    const newEvent = {
      id: Date.now(),
      ...event,
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const updateEvent = (id, event) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...event } : e)));
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within EventsProvider");
  }
  return context;
}
