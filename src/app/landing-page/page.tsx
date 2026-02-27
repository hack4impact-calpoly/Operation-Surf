import Image from "next/image";
import { Suspense } from "react";
import style from "@/app/landing-page/landing-page.module.css";

export default function LandingPage() {
  return (
    <div className={style.pageContainer}>
      {/* Page Header */}
      <div className={style.pageHeader}>
        <Image src="operation-surf.png" alt="Operation Surf Logo"></Image>
        <div className={style.loginButtons}>
          <button>Sign in</button>
          <button>Sign up</button>
        </div>
      </div>

      {/* Explore Programs */}
      <div className={style.explore}>
        {/* TODO */}
      </div>

      {/* About Us */}
      <div className={style.about}>
        {/* TODO */}
      </div>

      {/* Our Programs */}
      <div className={style.programs}>
        {/* TODO */}
      </div>

      {/* Contact Footer */}
      <div className={style.pageFooter}>
        {/* TODO */}
      </div>
    </div>
  )
}