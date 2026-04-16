import styles from "../../style/SelectedInstituteCard.module.css";

const SelectedInstituteCard = ({ institute }) => {
  const location = [institute.city, institute.state].filter(Boolean).join(", ");
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <img src={institute.logo} alt="logo" className={styles.logo} />

        <div className={styles.info}>
          <h3 className={styles.name}>{institute.name}</h3>
          {location ? (
            <p className={styles.location}>
              <span className={`material-symbols-rounded ${styles.locationIcon}`}>
                location_on
              </span>
              {location}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.badge}>
          <span className="material-symbols-rounded">verified</span>
        </div>
      </div>
    </div>
  );
};

export default SelectedInstituteCard;
