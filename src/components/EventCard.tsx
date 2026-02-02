import Image from "next/image";
import style from "@/styles/EventCard.module.css";

// definition of the props for the eventCard component
/* 
eventCardProps:
- place: location of the event
- name: name of the event
- host: host of the event
- availability: available spots formatted as "(x/y)"
- date: javascript Date object
- image: string (path to the image) should come from database in the future
*/
interface EventCardProps {
  place: string;
  name: string;
  host: string;
  availability: string;
  date: Date;
  image: string;
}

export default function EventCard({ place, name, host, availability, date, image }: EventCardProps) {
  return (
    <div className={style.eventCard}>
      {/* assuming event card is a link for now */}
      <a>
        <p className={style.date}>Date: {date.toDateString()}</p>
        <div className={style.imageWrapper}>
          <Image src={image} alt={`${name}-image`} className={style.image} fill />
        </div>
        <h2 className={style.name}>{name}</h2>
        <p className={style.place}>Place: {place}</p>
        <p className={style.host}>Host: {host}</p>
        <p className={style.availability}>Availability: {availability}</p>
      </a>
    </div>
  );
}
