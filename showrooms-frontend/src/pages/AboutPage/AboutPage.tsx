const AboutPage = () => (
  <div className="static-page">
    <div className="static-hero">
      <h1>О нас</h1>
      <p>AutoHub — сеть современных автосалонов по всей России. Мы помогаем найти автомобиль мечты с 2015 года.</p>
    </div>

    <div className="static-grid">
      <div className="static-card">
        <div className="static-card-num">20+</div>
        <div className="static-card-label">Шоурумов по стране</div>
      </div>
      <div className="static-card">
        <div className="static-card-num">5 000+</div>
        <div className="static-card-label">Автомобилей в наличии</div>
      </div>
      <div className="static-card">
        <div className="static-card-num">30 000+</div>
        <div className="static-card-label">Довольных клиентов</div>
      </div>
      <div className="static-card">
        <div className="static-card-num">9 лет</div>
        <div className="static-card-label">На рынке</div>
      </div>
    </div>

    <div className="static-section">
      <h2>Наша миссия</h2>
      <p>
        Мы верим, что покупка автомобиля должна быть простой и приятной. Наши специалисты помогут подобрать
        оптимальный вариант под любой бюджет и стиль жизни — от городского хэтчбека до премиального внедорожника.
      </p>
    </div>

    <div className="static-section">
      <h2>Почему AutoHub</h2>
      <div className="static-features">
        <div className="static-feature">
          <div className="static-feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4.5 8-11.4A8 8 0 004 10.6C4 17.5 12 22 12 22z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div className="static-feature-title">Прозрачные цены</div>
            <div className="static-feature-desc">Никаких скрытых комиссий — только честная стоимость автомобиля и услуг.</div>
          </div>
        </div>
        <div className="static-feature">
          <div className="static-feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4M7.8 3.5a9 9 0 108.4 0"/></svg>
          </div>
          <div>
            <div className="static-feature-title">Гарантия качества</div>
            <div className="static-feature-desc">Каждый автомобиль проходит многоточечную проверку перед продажей.</div>
          </div>
        </div>
        <div className="static-feature">
          <div className="static-feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 7v10M15 11v6M12 14v3"/></svg>
          </div>
          <div>
            <div className="static-feature-title">Поддержка 24/7</div>
            <div className="static-feature-desc">Наши менеджеры готовы ответить на любые вопросы в любое время.</div>
          </div>
        </div>
        <div className="static-feature">
          <div className="static-feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div className="static-feature-title">Широкий выбор</div>
            <div className="static-feature-desc">Более 50 брендов и тысячи комплектаций — найдём именно ваш автомобиль.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AboutPage;
