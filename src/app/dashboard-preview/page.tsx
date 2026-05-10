// src/app/dev/dashboard-preview/page.tsx
"use client";

import Dashboard from "@/components/Dashboard";

export default function DashboardPreviewPage() {
  const mockProfile = {
    profileId: "test-user",
    fullName: "John Mustang",
    email: "john.mustang@gmail.com",
    phone: "(555) 123-4567",
    location: "San Diego, CA",
    emergencyContact: "Jane Mustang - (555) 987-6543",
  };

  const mockShifts = [
    {
      shiftId: "shift-1",
      name: "Event #1",
      dayOfWeek: "Monday",
      date: "2026-03-10",
      startTime: "9:00 AM",
      endTime: "12:00 PM",
    },
    {
      shiftId: "shift-2",
      name: "Event #2",
      dayOfWeek: "Monday",
      date: "2026-03-10",
      startTime: "2:00 PM",
      endTime: "5:00 PM",
    },
    {
      shiftId: "shift-3",
      name: "Event #3",
      dayOfWeek: "Wednesday",
      date: "2026-03-12",
      startTime: "9:00 AM",
      endTime: "12:00 PM",
    },
    {
      shiftId: "shift-4",
      name: "Event #4",
      dayOfWeek: "Wednesday",
      date: "2026-03-12",
      startTime: "2:00 PM",
      endTime: "5:00 PM",
    },
    {
      shiftId: "shift-5",
      name: "Event #5",
      dayOfWeek: "Friday",
      date: "2026-03-14",
      startTime: "9:00 AM",
      endTime: "12:00 PM",
    },
    {
      shiftId: "shift-6",
      name: "Event #6",
      dayOfWeek: "Friday",
      date: "2026-03-14",
      startTime: "1:00 PM",
      endTime: "4:00 PM",
    },
  ];

  const mockRegisteredEvents = [
    {
      signupId: "signup-1",
      shiftId: "shift-1",
      name: "Event Name",
      date: "March 10, 2026",
      status: "Confirmed",
    },
    {
      signupId: "signup-2",
      shiftId: "shift-3",
      name: "Event Name",
      date: "March 12, 2026",
      status: "Confirmed",
    },
  ];

  const mockRegisteredShiftIds = new Set(["shift-1", "shift-3"]);

  return (
    <Dashboard
      profile={mockProfile}
      shifts={mockShifts}
      registeredEvents={mockRegisteredEvents}
      registeredShiftIds={mockRegisteredShiftIds}
      loadingProfile={false}
      loadingShifts={false}
      loadingEvents={false}
      onSignUp={(shiftId) => {
        console.log("sign up", shiftId);
      }}
      onCancel={(shiftId) => {
        console.log("cancel", shiftId);
      }}
    />
  );
}
