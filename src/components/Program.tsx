import ProgramCardImage from "@/components/ProgramCardImage";
import Link from "next/link";
import style from "@/styles/Program.module.css";

export type ProgramProps = {
  image: string;
  title: string;
  location: string;
  date: string;
  time: string;
  detailsHref?: string;
};

const Program = ({ image, title, location, date, time, detailsHref = "/program-details" }: ProgramProps) => {
  return (
    <div className={style.cardContainer}>
      <ProgramCardImage className={style.cardImage} src={image} alt={`${title} program`} />
      <div className={style.cardMeta}>
        <h2 className={style.cardTitle}>{title}</h2>
        <p className={style.cardLocation}>{location}</p>
        <p className={style.cardDate}>{date}</p>
        <p className={style.cardTime}>{time}</p>
      </div>
      <Link href={detailsHref} className={style.cardButton}>
        View Details
      </Link>
    </div>
  );
};

export default Program;
