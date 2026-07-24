import { useState } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  const [showCampaignNotice, setShowCampaignNotice] = useState(false);

  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-eyebrow">✦ Yeni Sezon Koleksiyonu</span>
        <h1 className="hero-title">
          İhtiyacın olan her şey, <span>tek adreste.</span>
        </h1>
        <p className="hero-subtitle">
          Elektronikten giyime, ev yaşamından spora kadar binlerce ürünü
          keşfet. Kaliteli ürünler, uygun fiyatlar, hızlı teslimat.
        </p>
        <div className="hero-actions">
          <Link to="/urunler" className="hero-cta">
            Alışverişe Başla
          </Link>
          <button
            type="button"
            className="hero-ctaSecondary"
            onClick={() => setShowCampaignNotice(true)}
          >
            Kampanyaları Gör
          </button>
        </div>

        <div className="hero-trust">
          <div className="hero-trustItem">
            <span className="hero-trustIcon">🚚</span>
            <span>Ücretsiz Kargo</span>
          </div>
          <div className="hero-trustItem">
            <span className="hero-trustIcon">🔒</span>
            <span>Güvenli Ödeme</span>
          </div>
          <div className="hero-trustItem">
            <span className="hero-trustIcon">↩</span>
            <span>Kolay İade</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-card hero-card--1">
          <div
            className="hero-cardImg"
            style={{ backgroundImage: "url(https://sozcu01.sozcucdn.com/sozcu/production/uploads/images/2026/5/telefonjpg-I3HmPpw5pEuflKNXy7ETnQ.jpg?w=776&h=436&mode=crop&scale=both)" }}
          />
          <div className="hero-cardLabel">Elektronik</div>
        </div>
        <div className="hero-card hero-card--2">
          <div
            className="hero-cardImg"
            style={{ backgroundImage: "url(https://www.btsoekonomi.com/upload/hazir-giyim-ve-konfeksiyon-sektoru-95126.jpg)" }}
          />
          <div className="hero-cardLabel">Giyim</div>
        </div>
        <div className="hero-card hero-card--3">
          <div
            className="hero-cardImg"
            style={{ backgroundImage: "url(https://media.licdn.com/dms/image/v2/D4D12AQEZcQSgi7N0Kw/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1660997580003?e=2147483647&v=beta&t=LZUNlmB2G4I8oyWLsHDZ0l_aidUc_EzNEv0m5eMbCeI)" }}
          />
          <div className="hero-cardLabel">Ev & Yaşam</div>
        </div>
      </div>

      {showCampaignNotice && (
        <div className="hero-modalOverlay" onClick={() => setShowCampaignNotice(false)}>
          <div className="hero-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hero-modalIcon">🔔</div>
            <h3 className="hero-modalTitle">Şu anda aktif bir kampanyamız bulunmuyor</h3>
            <p className="hero-modalText">
              Yeni kampanyalardan haberdar olmak için bizi takip etmeye devam edin.
            </p>
            <button
              type="button"
              className="hero-modalClose"
              onClick={() => setShowCampaignNotice(false)}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Hero;
