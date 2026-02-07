import React from "react";
import style from "../styles/volunteerApplication.module.css";
import Image from "next/image";

export default function VolunteerApplication() {
  return (
    <div className={style["va-center-wrapper"]}>
      <div className={style["va-container"]}>
        {/* top-left side of component */}
        <div className={style["va-card-title"]}>
          <div className={style["logo"]}>
            <Image src="/images/os_logo.jpg" alt="Operation Surf Logo" width={130} height={90} />
          </div>
          <div className={style["title"]}>
            <h3>Volunteer Application</h3>
          </div>
        </div>

        {/* user form */}
        <form className={style["va-form"]}>
          {/* divider */}
          <div className={style["divider"]}>
            <div className={style["divider-line"]} />
            <span className={style["divider-text"]}>Fill out below</span>
            <div className={style["divider-line"]} />
          </div>

          {/* name */}
          <input className={style["input"]} type="text" name="nameInput" placeholder="First and Last Name" />

          {/* email & phone number row */}
          <div className={style["input-row"]}>
            <input className={style["input"]} type="email" name="email" placeholder="Email" />
            <input className={style["input"]} type="text" name="phone" placeholder="Phone Number" />
          </div>
        </form>

        {/* buttons at bottom of component (back/submit) */}
        <div className={style["va-buttons"]}>
          <button>Back</button>
          <button type="submit">Submit</button>
        </div>
      </div>
    </div>
  );
}
