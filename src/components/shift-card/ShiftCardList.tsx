import React from "react";
import styles from "@/styles/ShiftCardList.module.css";
import ShiftCard from "./ShiftCard";
import { ShiftCardProps } from "./ShiftCard";

interface ShiftCardListProps {
  shifts: ShiftCardProps[];
}

const ShiftCardList: React.FC<ShiftCardListProps> = ({ shifts }) => {
  return (
    <div className={styles.container}>
      {/*<p className={styles.title}>SHIFTS</p>*/}
      {shifts.map((shift, index) => (
        <div className={styles.card} key={shift.id ?? index}>
          <ShiftCard {...shift} />
        </div>
      ))}
    </div>
  );
};

export default ShiftCardList;

/*
ex. data to test inside page.tsx:

const test_array: ShiftCardProps[] = [
    {
      name: "Morning Shift",
      description: "Help set up the event and prepare materials.",
      dateRange: "June 10, 2024",
      timeRange: "8:00 AM - 12:00 PM",
      timezone: "PST",
      location: "Community Center",
      spotsTaken: 5,
      spotsTotal: 10,
    },
    {
      name: "Afternoon Shift",
      description: "Assist with activities and engage with attendees.",
      dateRange: "June 10, 2024",
      timeRange: "12:00 PM - 4:00 PM",
      timezone: "PST",
      location: "Community Center",
      spotsTaken: 3,
      spotsTotal: 10,
    },
    {
      name: "Evening Shift",
      description: "Help with cleanup and wrap-up tasks.",
      dateRange: "June 10, 2024",
      timeRange: "4:00 PM - 8:00 PM",
      timezone: "PST",
      location: "Community Center",
      spotsTaken: 2,
      spotsTotal: 10,
    },
  ];

  <ShiftCardList shifts={test_array} />
*/
