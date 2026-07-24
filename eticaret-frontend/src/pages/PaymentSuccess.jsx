import { Link } from "react-router-dom";

function PaymentSuccess() {
  return (
    <div style={styles.wrap}>
      <div style={styles.icon}>✓</div>
      <h1 style={styles.title}>Siparişiniz Alındı!</h1>
      <p style={styles.text}>
        Ödemeniz başarıyla tamamlandı. Siparişiniz hazırlanmaya başlandı,
        kısa süre içinde kargoya verilecek.
      </p>
      <div style={styles.actions}>
        <Link to="/siparislerim" style={styles.primaryButton}>
          Siparişlerimi Görüntüle
        </Link>
        <Link to="/urunler" style={styles.secondaryButton}>
          Alışverişe Devam Et
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
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
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
    flexDirection: "column",
    gap: 12,
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
  secondaryButton: {
    padding: "12px 24px",
    borderRadius: 999,
    border: "1px solid rgba(20,38,28,0.15)",
    color: "#2d2d44",
    fontWeight: 600,
    textDecoration: "none",
    fontSize: 14,
  },
};

export default PaymentSuccess;
