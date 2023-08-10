import Link from "next/link";
import { useContext, useState } from "react";

import MainLayoutContext from "./MainLayoutContext";

import styles from "./TopNav.module.css";

export default function TopNav({ rightItem, noSideNav }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  const [doRotate, setDoRotate] = useState(false);
  const { sidenavOpen, setSidenavOpen } = useContext(MainLayoutContext);

  return (
    <div
      className={`d-flex justify-content-between align-items-center ${styles.topnav} position-fixed top-0 left-0 w-100`}
    >
      <div className="d-flex justify-content-start align-items-center">
        {!noSideNav ? (
          <div
            className={`d-flex justify-content-center align-items-center ${styles.menuBtnHolder}`}
          >
            <button
              className={styles.menuBtn}
              onClick={(e) => {
                setDoRotate(!doRotate);
                setSidenavOpen(!sidenavOpen);
              }}
            >
              <i
                className={`fa-solid fa-${
                  sidenavOpen ? "arrow-right" : "bars"
                } ${styles.rotate} ${doRotate ? styles.full : ""}`}
              ></i>
            </button>
          </div>
        ) : null}
        <Link
          href="/"
          className="text-decoration-none"
          style={{
            padding: "10px 0",
          }}
        >
          <div className="mx-3">
            <img src="/logo.png" alt="Logo" height="55px" />
            {appName ? (
              <div>
                <small
                  className="font-zapp-extrabold text-lowercase"
                  style={{ fontSize: ".6rem" }}
                >
                  {appName}
                </small>
              </div>
            ) : null}
          </div>
        </Link>
      </div>
      <div className="me-3">{rightItem}</div>
    </div>
  );
}
