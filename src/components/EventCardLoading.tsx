import Image from "next/image";
import style from "@/styles/EventCard.module.css";

/* 
eventCardProps:
- place: location of the event
- name: name of the event
- host: host of the event
- availability: available spots formatted as "(x/y)"
- date: javascript Date object
- image: string (path to the image) should come from database in the future
*/

export default function EventCardLoading() {
  return (
    <div className={style.eventCard}>
      <p>Loading...</p>
    </div>
  );
}
