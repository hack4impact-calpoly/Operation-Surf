import Image from "next/image";
import style from "@/styles/EventCard.module.css";
import { Suspense } from "react";
import EventCardLoading from "@/components/event_card/EventCardLoading";

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
  availability: number;
  MaxAvailability: number;
  date: Date;
  image: string;
  hostIcon: string;
}

export default function EventCard({
  place,
  name,
  host,
  availability,
  MaxAvailability,
  date,
  image,
  hostIcon,
}: EventCardProps) {
  return (
    <div className={style.eventCard}>
      {/* assuming event card is a link for now */}
      <a>
        <Suspense fallback={<EventCardLoading />}>
          <div className={style.imageWrapper}>
            <Image src={image} alt={`${name}-image`} className={style.image} fill />
            <div className={style.dateWrapper}>{dateComponent(date)}</div>
          </div>
          <p className={style.place}>{place}</p>
          <h2 className={style.name}>{name}</h2>
          <div className={style.host}>
            {hostIcon && (
              <Image src={hostIcon} alt={`${host}-logo`} width={24} height={24} className={style.hostIcon} />
            )}
            <span>{host}</span>
          </div>
          <p className={style.availability}>
            {availability}/{MaxAvailability} Spots
          </p>
        </Suspense>
      </a>
    </div>
  );
}

const days = ["SUN", "MON", "TUES", "WED", "THUR", "FRI", "SAT"];

const months = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
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
