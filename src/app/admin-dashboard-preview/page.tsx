"use client";

import AdminUserDashboard from "@/components/AdminUserDashboard";

const fakeProfile = {
  userId: "fake-user-id-123",
  fullName: "John Mustang",
  email: "john.mustang@email.com",
  phone: "(555) 123-4567",
  location: "San Diego, CA",
  emergencyContact: "Jane Mustang - (555) 987-6543",
  notes: "Usually arrives early\nLikes to bring Golden Retriever, Cooper",
  hours: 10,
  monthJoined: "06/26",
};

const fakeEvents = [
  {
    signupId: "signup-1",
    shiftId: "shift-1",
    name: "Event Name",
    date: "2026-03-10T00:00:00.000Z",
    status: "Confirmed",
  },
  {
    signupId: "signup-2",
    shiftId: "shift-2",
    name: "Event Name",
    date: "2026-03-12T00:00:00.000Z",
    status: "Confirmed",
  },
];

export default function AdminDashboardPreview() {
  return <AdminUserDashboard profile={fakeProfile} registeredEvents={fakeEvents} />;
}
