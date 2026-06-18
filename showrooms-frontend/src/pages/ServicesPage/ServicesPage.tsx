const ServicesPage = () => (
  <div className="static-page">
    <div className="static-hero">
      <h1>Услуги</h1>
      <p>Полный спектр услуг для покупки, обслуживания и продажи автомобилей.</p>
    </div>

    <div className="services-grid">
      <div className="service-card">
        <div className="service-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17v2a1 1 0 001 1h1a1 1 0 001-1v-2M19 17v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2"/><path d="M3 13l1.5-5a2 2 0 012-1.5h11a2 2 0 012 1.5L21 13v4H3v-4z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/></svg>
        </div>
        <h3>Тест-драйв</h3>
        <p>Запишитесь на тест-драйв любого понравившегося автомобиля. Опытный менеджер расскажет обо всех особенностях модели.</p>
      </div>

      <div className="service-card">
        <div className="service-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h3>Трейд-ин</h3>
        <p>Сдайте ваш старый автомобиль в зачёт стоимости нового. Быстрая оценка и выгодный обмен прямо у нас в салоне.</p>
      </div>

      <div className="service-card">
        <div className="service-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M16 14a2 2 0 100-4 2 2 0 000 4zM6 10h4"/></svg>
        </div>
        <h3>Кредит и лизинг</h3>
        <p>Партнёрство с ведущими банками страны. Одобрение кредита за 30 минут, первоначальный взнос от 10%.</p>
      </div>

      <div className="service-card">
        <div className="service-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4M7.8 3.5a9 9 0 108.4 0"/></svg>
        </div>
        <h3>Страхование</h3>
        <p>ОСАГО и КАСКО от надёжных страховщиков. Оформим все документы прямо при покупке автомобиля.</p>
      </div>

      <div className="service-card">
        <div className="service-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-3 3zM3 16l7-7 3.5 3.5L12 14l5 5H3v-3z"/></svg>
        </div>
        <h3>Дополнительное оборудование</h3>
        <p>Тонировка, защитные плёнки, коврики, сигнализации и другие аксессуары с профессиональной установкой.</p>
      </div>

      <div className="service-card">
        <div className="service-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h3>Выездная доставка</h3>
        <p>Доставим автомобиль прямо к вашему дому или офису. Услуга доступна в пределах города.</p>
      </div>
    </div>
  </div>
);

export default ServicesPage;
