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
    emergencyContact: {
      name: "Jane Mustang",
      relationship: "Sister",
      phone: "(555) 987-6543",
      email: "jane.mustang@example.com",
    },
  };

  const mockShifts = [
    {
      shiftId: "shift-1",
      name: "Day #1",
      dayOfWeek: "Monday",
      date: "2026-03-10",
      startTime: "9:00 AM",
      endTime: "12:00 PM",
    },
    {
      shiftId: "shift-2",
      name: "Day #2",
      dayOfWeek: "Monday",
      date: "2026-03-10",
      startTime: "2:00 PM",
      endTime: "5:00 PM",
    },
    {
      shiftId: "shift-3",
      name: "Day #3",
      dayOfWeek: "Wednesday",
      date: "2026-03-12",
      startTime: "9:00 AM",
      endTime: "12:00 PM",
    },
    {
      shiftId: "shift-4",
      name: "Day #4",
      dayOfWeek: "Wednesday",
      date: "2026-03-12",
      startTime: "2:00 PM",
      endTime: "5:00 PM",
    },
    {
      shiftId: "shift-5",
      name: "Day #5",
      dayOfWeek: "Friday",
      date: "2026-03-14",
      startTime: "9:00 AM",
      endTime: "12:00 PM",
    },
    {
      shiftId: "shift-6",
      name: "Day #6",
      dayOfWeek: "Friday",
      date: "2026-03-14",
      startTime: "1:00 PM",
      endTime: "4:00 PM",
    },
  ];

  const mockRegisteredDays = [
    {
      signupId: "signup-1",
      shiftId: "shift-1",
      name: "Day Name",
      date: "March 10, 2026",
      status: "Confirmed",
    },
    {
      signupId: "signup-2",
      shiftId: "shift-3",
      name: "Day Name",
      date: "March 12, 2026",
      status: "Confirmed",
    },
  ];

  const mockRegisteredShiftIds = new Set(["shift-1", "shift-3"]);

  return (
    <Dashboard
      profile={mockProfile}
      shifts={mockShifts}
      registeredDays={mockRegisteredDays}
      registeredShiftIds={mockRegisteredShiftIds}
      loadingProfile={false}
      loadingShifts={false}
      loadingDays={false}
      onSignUp={(shiftId) => {
        console.log("sign up", shiftId);
      }}
      onCancel={(shiftId) => {
        console.log("cancel", shiftId);
      }}
      onSaveProfile={async () => {}}
    />
  );
}
