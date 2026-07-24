import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";
import addressService from "../services/addressService";

function getRoleFromToken(token) {
  if(!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".") [1]));

    return (
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
      payload.role ||
      null
    );
  } catch {
    return null;
  }
}

function getUserIdFromToken(token) {
  if(!token) return null;
  try{
    const payload = JSON.parse(atob(token.split(".") [1]));
    return (
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      payload.nameid ||
      payload.sub ||
      null
    );
  } catch {
    return null;
  }
}

function AuthPage({ initialMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState(initialMode || "login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [registerStep, setRegisterStep] = useState(1);
  const [addressForm, setAddressForm] = useState({
    title: "",
    city: "",
    district: "",
    neighborhood: "",
    fullAddress: "",
    postalCode: "",
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [addressError, setAddressError] = useState("");


  useEffect(() => {
    if (location.pathname === "/kayit") setMode("register");
    if (location.pathname === "/giris") setMode("login");
  }, [location.pathname]);

  useEffect(() => {
    if(location.state?.notice) {
      setToast(location.state.notice);
      const timer = setTimeout(() => setToast(""),3000);
      return() => clearTimeout(timer);
    }
  }, [location.state]);

  const switchTo = (nextMode) => {
    setError("");
    navigate(nextMode === "login" ? "/giris" : "/kayit");
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  useEffect(() => { 
    fetch("https://api.turkiyeapi.com/api/iller") 
      .then((res) => res.json()) 
      .then((res) => setProvinces(res.data || [])) 
      .catch(() => setProvinces([])); 
    }, []);
  const handleAddressChange = (field, value) => { 
    setAddressForm((prev) => ({ ...prev, [field]: value })); 
  }; 
  const handleProvinceChange = (tkgmId, label) => { 
    setSelectedProvinceId(tkgmId); 
    setSelectedDistrictId(""); 
    setDistricts([]); 
    setNeighborhoods([]); 
    handleAddressChange("city", label); 
    handleAddressChange("district", ""); 
    handleAddressChange("neighborhood", ""); 
    
    if (!tkgmId) return; 
    fetch(`https://api.turkiyeapi.com/api/ilceler/${tkgmId}`) 
      .then((res) => res.json()) 
      .then((res) => setDistricts(res.data || [])) 
      .catch(() => setDistricts([])); }; 
  
  const handleDistrictChange = (tkgmId, label) => { 
    setSelectedDistrictId(tkgmId); 
    setNeighborhoods([]); 
    handleAddressChange("district", label); 
    handleAddressChange("neighborhood", ""); 
    
    if (!tkgmId) return; 
    fetch(`https://api.turkiyeapi.com/api/mahalleler/${tkgmId}`) 
      .then((res) => res.json()) 
      .then((res) => setNeighborhoods(res.data || [])) 
      .catch(() => setNeighborhoods([])); }; 
  
  const handleNeighborhoodChange = (label) => { 
    handleAddressChange("neighborhood", label); 
  }; 

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    authService
      .login(loginData)
      .then((response) => {
        setError("");
        setLoading(false);
        const token = response.data.token;
        login(token);
        
        const role = getRoleFromToken(token);
        navigate(role === "admin" ? "/admin" : "/");
      })
      .catch((err) => {
        setLoading(false);
        const message = err.response?.data;
        setError(typeof message === "string" ? message : "E-posta veya şifre hatalı.");
      });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (registerStep === 1) {
      setRegisterStep(2);
      return;
    }

    setAddressError("");
    setLoading(true);
    authService
      .register(registerData)
      .then(() => authService.login({ email: registerData.email, password: registerData.password }))
      .then((loginResponse) => {
        const token = loginResponse.data.token;
        login(token);
        const userId = getUserIdFromToken(token);

        const hasAddressInfo = addressForm.city || addressForm.fullAddress;
        if (!hasAddressInfo || !userId) {
          setLoading(false);
          navigate("/");
          return;
        }

        addressService
          .create({ ...addressForm, userId })
          .then(() => {
            setLoading(false);
            navigate("/");
          })
          .catch(() => {
            setLoading(false);
            navigate("/");
          });
      })
      .catch((err) => {
        setLoading(false);
        const message = err.response?.data;
        setError(typeof message === "string" ? message : "Kayıt sırasında bir hata oluştu.");
      });
  };

  const handleBackToAccountStep = () => {
    setError("");
    setRegisterStep(1);
  };


  return (
    <div className="auth-shell">
      {toast && (
        <div className = "auth-toast">
          <span className = "auth-toastIcon">✓</span>
          {toast}
        </div>
      )}

      <div className="auth-decor" aria-hidden="true">
        <svg className="auth-decorIcon auth-decorIcon--bag" viewBox="0 0 64 64" fill="none">
          <path d="M14 22h36l-3 34a4 4 0 0 1-4 3.6H21a4 4 0 0 1-4-3.6L14 22Z" stroke="currentColor" strokeWidth="2" />
          <path d="M22 22v-4a10 10 0 0 1 20 0v4" stroke="currentColor" strokeWidth="2" />
        </svg>
        <svg className="auth-decorIcon auth-decorIcon--tag" viewBox="0 0 64 64" fill="none">
          <path d="M8 8h22l26 26-22 22L8 30V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
        <svg className="auth-decorIcon auth-decorIcon--box" viewBox="0 0 64 64" fill="none">
          <path d="M8 20 32 8l24 12v28L32 60 8 48V20Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M8 20 32 32l24-12M32 32v28" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <svg className="auth-decorIcon auth-decorIcon--cart" viewBox="0 0 64 64" fill="none">
          <path d="M6 8h6l6 32h32l6-22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="52" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="42" cy="52" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="auth-mobileTabs">
        <button className={mode === "login" ? "is-active" : ""} onClick={() => switchTo("login")}>
          Giriş yap
        </button>
        <button className={mode === "register" ? "is-active" : ""} onClick={() => switchTo("register")}>
          Kayıt ol
        </button>
      </div>

      <div className="auth-forms">
        <div className={`auth-formSlot ${mode === "login" ? "auth-formSlot--active" : ""} ${registerStep === 2 ? "auth-formSlot--step2" : ""}`}>
          <div className="auth-card">
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <span className="auth-eyebrow">Tekrar hoş geldiniz</span>
              <h1 className="auth-title">Giriş yap</h1>
              <p className="auth-sub">Siparişlerine ve sepetine devam etmek için giriş yap.</p>

              {mode === "login" && error && <div className="auth-error">{error}</div>}

              <label className="auth-label">
                E-posta
                <input
                  className="auth-input"
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </label>
              <label className="auth-label">
                Şifre
                <input
                  className="auth-input"
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </label>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading && mode === "login" ? "Giriş yapılıyor..." : "Giriş yap"}
              </button>
            </form>
          </div>
        </div>

        <div className={`auth-formSlot ${mode === "register" ? "auth-formSlot--active" : ""}`}>
          <div className={`auth-card ${registerStep === 2 ? "auth-card--step2" : ""}`}>
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <span className="auth-eyebrow">Aramıza katıl</span>
              <h1 className="auth-title">Hesap oluştur</h1>
              <p className="auth-sub">
                {registerStep === 1
                  ? "Birkaç bilgiyle alışverişe başlamaya hazır ol."
                  : "Son adım: teslimat adresini ekle (istersen sonra da ekleyebilirsin)."}
              </p>

              {mode === "register" && error && <div className="auth-error">{error}</div>}

              {registerStep === 1 && (
                <>
                  <label className="auth-label">
                    Ad Soyad
                    <input
                      className="auth-input"
                      type="text"
                      name="name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      required
                    />
                  </label>
                  <label className="auth-label">
                    E-posta
                    <input
                      className="auth-input"
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </label>
                  <label className="auth-label">
                    Telefon <span className="auth-optional">(opsiyonel)</span>
                    <input
                      className="auth-input"
                      type="tel"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                    />
                  </label>
                  <label className="auth-label">
                    Şifre
                    <input
                      className="auth-input"
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </label>
                </>
              )}

              {registerStep === 2 && (
                <div className="auth-step2Fields">
                  <label className="auth-label">
                    Adres Başlığı
                    <input
                      className="auth-input"
                      type="text"
                      value={addressForm.title}
                      onChange={(e) => handleAddressChange("title", e.target.value)}
                      placeholder="Ev, İş..."
                    />
                  </label>

                  <label className="auth-label">
                    Şehir
                    <select
                      className="auth-input"
                      value={selectedProvinceId}
                      onChange={(e) => {
                        const tkgmId = e.target.value;
                        const label = provinces.find((p) => p.tkgm_id === tkgmId)?.label || "";
                        handleProvinceChange(tkgmId, label);
                      }}
                    >
                      <option value="">Seçiniz</option>
                      {provinces.map((p) => (
                        <option key={p.tkgm_id} value={p.tkgm_id}>{p.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="auth-label">
                    İlçe
                    <select
                      className="auth-input"
                      value={selectedDistrictId}
                      onChange={(e) => {
                        const tkgmId = e.target.value;
                        const label = districts.find((d) => d.tkgm_id === tkgmId)?.label || "";
                        handleDistrictChange(tkgmId, label);
                      }}
                      disabled={!selectedProvinceId}
                    >
                      <option value="">Seçiniz</option>
                      {districts.map((d) => (
                        <option key={d.tkgm_id} value={d.tkgm_id}>{d.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="auth-label">
                    Mahalle
                    <select
                      className="auth-input"
                      value={addressForm.neighborhood}
                      onChange={(e) => handleNeighborhoodChange(e.target.value)}
                      disabled={!selectedDistrictId}
                    >
                      <option value="">Seçiniz</option>
                      {neighborhoods.map((n) => (
                        <option key={n.tkgm_id} value={n.label}>{n.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="auth-label">
                    Adres
                    <input
                      className="auth-input"
                      type="text"
                      value={addressForm.fullAddress}
                      onChange={(e) => handleAddressChange("fullAddress", e.target.value)}
                      placeholder="Cadde, sokak, no..."
                    />
                  </label>

                  <label className="auth-label">
                    Posta Kodu
                    <input
                      className="auth-input"
                      type="text"
                      inputMode="numeric"
                      value={addressForm.postalCode}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 5);
                        handleAddressChange("postalCode", digitsOnly);
                      }}
                      placeholder="Örn: 34000"
                    />
                  </label>

                  {addressError && <div className="auth-error">{addressError}</div>}
                </div>
              )}

              <div className="auth-stepActions">
                {registerStep === 2 && (
                  <button
                    type="button"
                    className="auth-backButton"
                    onClick={handleBackToAccountStep}
                  >
                    Geri
                  </button>
                )}
                <button className="auth-submit" type="submit" disabled={loading}>
                  {loading
                    ? "Kayıt oluşturuluyor..."
                    : registerStep === 1
                    ? "Devam Et"
                    : "Kayıt ol"}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      <div className={`auth-cover ${mode === "register" ? "auth-cover--left" : "auth-cover--right"}`}>
        <div className="auth-coverInner">
          <div className="auth-mark">Shoply</div>

          <ul className="auth-benefits">
            <li>Siparişlerini kolayca takip et</li>
            <li>Favori ürünlerini listene ekle</li>
            <li>Üyelere özel fırsatları kaçırma</li>
          </ul>

          <button
            type="button"
            className="auth-coverButton"
            onClick={() => switchTo(mode === "register" ? "login" : "register")}
          >
            {mode === "register" ? "Giriş yap" : "Hemen kayıt ol"}
          </button>
        </div>

        <div className="auth-marquee" aria-hidden="true">
          <div className="auth-marqueeTrack">
            <span>Ücretsiz Kargo</span>
            <span>Güvenli Ödeme</span>
            <span>Kolay İade</span>
            <span>7/24 Destek</span>
            <span>Ücretsiz Kargo</span>
            <span>Güvenli Ödeme</span>
            <span>Kolay İade</span>
            <span>7/24 Destek</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
