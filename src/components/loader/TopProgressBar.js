// src/components/common/TopProgressBar.js
import styles from "../../style/TopProgressBar.module.css";

/**
 * TopProgressBar — Apple-style indeterminate progress bar
 *
 * Renders a thin 3px bar fixed at the very top of the screen.
 * Pass `visible={true}` to show it (e.g. during API calls / page transitions).
 * Pass `visible={false}` to hide it — component unmounts cleanly.
 *
 * Usage:
 *   import TopProgressBar from "../components/common/TopProgressBar";
 *   <TopProgressBar visible={loading} />
 */
const TopProgressBar = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.fill} />
    </div>
  );
};

export default TopProgressBar;
