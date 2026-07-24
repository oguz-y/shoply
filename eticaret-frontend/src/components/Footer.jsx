import { useState } from "react";
import "./Footer.css";

const corporateInfo = {
  hakkimizda:
    "Shoply, 2026 yılında kurulmuş, Sakarya merkezli bir e-ticaret platformudur. Amacımız, güvenilir ve uygun fiyatlı alışveriş deneyimini herkese ulaştırmaktır.",
  iletisim:
    "Bize destek@shoply.com adresinden veya 0850 000 00 00 numaralı hattımızdan 7/24 ulaşabilirsiniz.",
  sss:
    "Sipariş takibi, iade süreçleri ve ödeme yöntemleri hakkında merak ettiklerinizi profil sayfanızdaki 'Siparişlerim' bölümünden takip edebilirsiniz.",
};

const supportInfo = {
  kargoIade:
    "Siparişleriniz 1-3 iş günü içinde kargoya verilir. Ürünlerinizi teslim aldıktan sonra 14 gün içinde iade edebilirsiniz.",
  gizlilik:
    "Kişisel verileriniz yalnızca sipariş ve teslimat süreçleri için kullanılır, üçüncü taraflarla paylaşılmaz.",
  kullanimKosullari:
    "Siteyi kullanarak, satın alma ve iade koşullarımızı kabul etmiş sayılırsınız.",
};

function Footer() {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (key) => {
    setOpenItem((prev) => (prev === key ? null : key));
  };

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h3 className="footer-brand">Shoply</h3>
          <p className="footer-about">
            Shoply, ihtiyacınız olan her şeyi tek bir çatı altında buluşturan
            güvenilir bir e-ticaret platformudur. Kaliteli ürünler, hızlı
            teslimat ve müşteri memnuniyeti önceliğimizdir.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Kurumsal</h4>
          <ul className="footer-links">
            <li>
              <button className="footer-linkButton" onClick={() => toggleItem("hakkimizda")}>
                <span>Hakkımızda</span>
                <span className={`footer-linkArrow ${openItem === "hakkimizda" ? "is-open" : ""}`}>›</span>
              </button>
              {openItem === "hakkimizda" && (
                <p className="footer-linkDetail">{corporateInfo.hakkimizda}</p>
              )}
            </li>
            <li>
              <button className="footer-linkButton" onClick={() => toggleItem("iletisim")}>
                <span>İletişim</span>
                <span className={`footer-linkArrow ${openItem === "iletisim" ? "is-open" : ""}`}>›</span>
              </button>
              {openItem === "iletisim" && (
                <p className="footer-linkDetail">{corporateInfo.iletisim}</p>
              )}
            </li>
            <li>
              <button className="footer-linkButton" onClick={() => toggleItem("sss")}>
                <span>Sıkça Sorulan Sorular</span>
                <span className={`footer-linkArrow ${openItem === "sss" ? "is-open" : ""}`}>›</span>
              </button>
              {openItem === "sss" && (
                <p className="footer-linkDetail">{corporateInfo.sss}</p>
              )}
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Müşteri Hizmetleri</h4>
          <ul className="footer-links">
            <li>
              <button className="footer-linkButton" onClick={() => toggleItem("kargoIade")}>
                <span>Kargo &amp; İade</span>
                <span className={`footer-linkArrow ${openItem === "kargoIade" ? "is-open" : ""}`}>›</span>
              </button>
              {openItem === "kargoIade" && (
                <p className="footer-linkDetail">{supportInfo.kargoIade}</p>
              )}
            </li>
            <li>
              <button className="footer-linkButton" onClick={() => toggleItem("gizlilik")}>
                <span>Gizlilik Politikası</span>
                <span className={`footer-linkArrow ${openItem === "gizlilik" ? "is-open" : ""}`}>›</span>
              </button>
              {openItem === "gizlilik" && (
                <p className="footer-linkDetail">{supportInfo.gizlilik}</p>
              )}
            </li>
            <li>
              <button className="footer-linkButton" onClick={() => toggleItem("kullanimKosullari")}>
                <span>Kullanım Koşulları</span>
                <span className={`footer-linkArrow ${openItem === "kullanimKosullari" ? "is-open" : ""}`}>›</span>
              </button>
              {openItem === "kullanimKosullari" && (
                <p className="footer-linkDetail">{supportInfo.kullanimKosullari}</p>
              )}
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Bize Ulaşın</h4>
          <ul className="footer-contact">
            <li>📍 Sakarya, Türkiye</li>
            <li>📧 destek@shoply.com</li>
            <li>📞 0850 000 00 00</li>
          </ul>
          <div className="footer-social">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Twitter">TW</a>
            <a href="#" aria-label="Facebook">FB</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Shoply. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}

export default Footer;
