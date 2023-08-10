import { ProgressBar, Table } from "react-bootstrap";
import { useState } from "react";

import MainLayoutContext from "./MainLayoutContext";
import SideNavMenus from "./SideNavMenus";
import TopNav from "./TopNav";
import WrapWithHead from "../_shared/components/WrapWithHead";
import styles from "./Main.module.css";

export default function Main({
  children,
  icon,
  rightItem = null,
  routes = [],
  title,
}) {
  const [sidenavOpen, setSidenavOpen] = useState(false);

  return (
    <MainLayoutContext.Provider value={{ sidenavOpen, setSidenavOpen }}>
      <WrapWithHead title={title}>
        <TopNav rightItem={rightItem} noSideNav={routes.length === 0} />
        {routes.length > 0 ? (
          <div
            className={`shadow zapp-scroll ${styles.sidenav} ${
              sidenavOpen ? styles.open : ""
            }`}
          >
            <SideNavMenus routes={routes} open={sidenavOpen} />
          </div>
        ) : null}
        <div
          className={`${styles.mainContent} ${sidenavOpen ? styles.open : ""} ${
            routes.length === 0 ? "ms-0" : ""
          }`}
        >
          <div className="p-4 p-sm-5">
            <div
              className="bg-zapp-gradient"
              style={{ height: "5px", opacity: 0.3 }}
            ></div>
            <h1 className="font-zapp-bold text-zapp h2 ellipsis">
              {icon ? (
                <small
                  className="me-3"
                  style={{
                    borderRight: "solid 5px #ee459a4d",
                  }}
                >
                  <i className={`${icon} mx-3`}></i>
                </small>
              ) : null}
              <big>{title}</big>
            </h1>
            <div
              className="bg-zapp-gradient mb-4 mb-sm-5"
              style={{ height: "5px", opacity: 0.3 }}
            />
            {children}
          </div>
        </div>
      </WrapWithHead>
    </MainLayoutContext.Provider>
  );
}
