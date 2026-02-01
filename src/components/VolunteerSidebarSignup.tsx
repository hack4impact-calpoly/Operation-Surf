import styles from "../styles/VolunteerSidebarSignup.module.css";

type VolunteerSidebarSignupProps = {
  title?: string;
  buttonText?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

const VolunteerSidebarSignup = ({
  title = "SIGN UP TO VOLUNTEER",
  buttonText = "GO",
  onClick,
  ariaLabel = "Sign up to volunteer",
}: VolunteerSidebarSignupProps) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <button type="button" className={styles.button} onClick={onClick} aria-label={ariaLabel}>
        {buttonText}
      </button>
    </div>
  );
};

export default VolunteerSidebarSignup;
