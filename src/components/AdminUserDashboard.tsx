import styles from "@/styles/AdminUserDashboard.module.css";

type Profile = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  emergencyContact: string;
  notes: string;
};

type RegisteredEvent = {
  signupId: string;
  shiftId: string;
  name: string;
  date: string | null;
  status: string;
};

type AdminUserDashboardProps = {
  profile: Profile;
  registeredEvents: RegisteredEvent[];
};

export default function AdminUserDashboard({ profile, registeredEvents }: AdminUserDashboardProps) {
  return (
    <div className={styles.container}>
      <section className={styles.header}>{/* TODO: header */}</section>
      <section className={styles.basicInfo}>{/* TODO: info section */}</section>
      <section className={styles.notes}>{/* TODO: editable notes (PATCH /api/volunteer/[userId]) */}</section>
      <section className={styles.registeredEvents}>{/* TODO: registered events list w/ status */}</section>
    </div>
  );
}
