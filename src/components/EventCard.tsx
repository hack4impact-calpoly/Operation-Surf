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
        <div className={style.imageWrapper}>
          <Image src={image} alt={`${name}-image`} className={style.image} fill />
          <div className={style.dateWrapper}>{dateComponent(date)}</div>
        </div>
        <p className={style.place}> {place}</p>
        <h2 className={style.name}>{name}</h2>
        <p className={style.host}>{host}</p>
        <p className={style.availability}>{availability} Spots</p>
      </a>
    </div>
  );
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* 
dateComponent:
  pass date to component and it will return the formatted date
  in a div with day of the week, day of the month, and month name

  date object methods return 0-indexed values for month and day of the week, uses that as an index to get the string from the days/months arrays
  
props:
- date: javascript Date object
*/

function dateComponent(date: Date) {
  return (
    <div className={style.dateContainer}>
      <p className={style.date}>{days[date.getDay()]}</p>
      <p className={style.dateDay}>{date.getDate()}</p>
      <p className={style.date}>{months[date.getMonth()]}</p>
    </div>
  );
}
