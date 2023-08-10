import ReactLoading from "react-loading";

import styles from "./loading.module.css";

export default function Loading({ show }) {
  return (
    <div className={styles.overlay} style={{ display: show ? "flex" : "none" }}>
      <ReactLoading type="spin" color="#ffffff" height={100} width={100} />
    </div>
  );
}
