import { Link } from "react-router-dom";

function PaymentFailed() {
  return (
    <div style={styles.wrap}>
      <div style={styles.icon}>✕</div>
      <h1 style={styles.title}>Ödeme Başarısız</h1>
      <p style={styles.text}>
        Ödemeniz tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar
        deneyebilir, ya da farklı bir ödeme yöntemi seçebilirsiniz.
      </p>
      <div style={styles.actions}>
        <Link to="/sepet" style={styles.primaryButton}>
          Sepete Dön
        </Link>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: 480,
    margin: "80px auto",
    textAlign: "center",
    padding: "48px 32px",
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c0392b, #e74c3c)",
    color: "#fff",
    fontSize: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1f1b2e",
    margin: "0 0 12px",
  },
  text: {
    fontSize: 14.5,
    color: "#6d6878",
    lineHeight: 1.6,
    margin: "0 0 28px",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
  },
  primaryButton: {
    padding: "12px 24px",
    borderRadius: 999,
    background: "linear-gradient(90deg, #e8542e, #f3894f)",
    color: "#fff",
    fontWeight: 600,
    textDecoration: "none",
    fontSize: 14,
  },
};

export default PaymentFailed;
