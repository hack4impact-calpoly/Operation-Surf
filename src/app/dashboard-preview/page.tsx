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
      id: "shift-1",
      title: "Morning Check-In",
      startTime: "2026-04-20T09:00:00",
      endTime: "2026-04-20T12:00:00",
    },
  ];

  const mockRegisteredEvents = [
    {
      id: "event-1",
      name: "Community Food Drive",
    },
  ];

  const mockRegisteredShiftIds = new Set(["shift-1"]);

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
