import ProgramCardImage from "@/components/ProgramCardImage";
import style from "@/styles/Program.module.css";

export type ProgramProps = {
  image: string;
  title: string;
  location: string;
  date: string;
  time: string;
  onClick?: () => void;
};

const Program = ({ image, title, location, date, time, onClick }: ProgramProps) => {
  return (
    <div className={style.cardContainer}>
      <ProgramCardImage className={style.cardImage} src={image} alt={`${title} program`} />
      <div className={style.cardMeta}>
        <h2 className={style.cardTitle}>{title}</h2>
        <p className={style.cardLocation}>{location}</p>
        <p className={style.cardDate}>{date}</p>
        <p className={style.cardTime}>{time}</p>
      </div>
      <button className={style.cardButton} onClick={onClick}>
        View Details
      </button>
    </div>
  );
};

export default Program;
