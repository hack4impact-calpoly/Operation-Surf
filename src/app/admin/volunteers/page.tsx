import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/database/db";
import Volunteer from "@/database/models/volunteerSchema";
import { getAuthContext } from "@/lib/authz";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type VolunteerListRecord = {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  hours?: number;
  volunteerCount?: number;
  createdAt?: Date | string;
};

function formatJoinedDate(value?: Date | string) {
  if (!value) return "Unknown";

  const joined = new Date(value);
  if (Number.isNaN(joined.getTime())) {
    return "Unknown";
  }

  return joined.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function getVolunteers(): Promise<VolunteerListRecord[]> {
  const volunteers = await Volunteer.find().sort({ name: 1 }).lean<VolunteerListRecord[]>();

  return volunteers;
}

export default async function AdminVolunteersPage() {
  const { isAdmin } = await getAuthContext();

  if (!isAdmin) {
    notFound();
  }

  await connectDB();
  const volunteers = await getVolunteers();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Admin</p>
        <h1 className={styles.title}>Volunteer Directory</h1>
        <p className={styles.subtitle}>
          Browse every volunteer profile and jump into the full admin dashboard for notes and registration details.
        </p>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>All Volunteers</h2>
            <p className={styles.sectionMeta}>
              {volunteers.length} volunteer{volunteers.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {volunteers.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No volunteers yet</h3>
            <p>Volunteer profiles will appear here once applications have been submitted.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Hours</th>
                  <th>Joined</th>
                  <th aria-label="View volunteer profile" />
                </tr>
              </thead>
              <tbody>
                {volunteers.map((volunteer) => (
                  <tr key={volunteer.userId}>
                    <td>
                      <div className={styles.primaryCell}>
                        <span className={styles.name}>{volunteer.name}</span>
                        <span className={styles.meta}>Shifts: {volunteer.volunteerCount ?? 0}</span>
                      </div>
                    </td>
                    <td>{volunteer.email}</td>
                    <td>{volunteer.phone || "Not provided"}</td>
                    <td>{volunteer.location || "Not provided"}</td>
                    <td>{volunteer.hours ?? 0}</td>
                    <td>{formatJoinedDate(volunteer.createdAt)}</td>
                    <td>
                      <Link href={`/admin/users/${volunteer.userId}`} className={styles.viewLink}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
