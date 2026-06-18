const ContactsPage = () => (
  <div className="static-page">
    <div className="static-hero">
      <h1>Контакты</h1>
      <p>Мы всегда рады помочь. Свяжитесь с нами любым удобным способом.</p>
    </div>

    <div className="contacts-info">
        <div className="contact-block">
          <div className="contact-block-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.9.5 2.9.7a2 2 0 011.7 2z"/></svg>
          </div>
          <div>
            <div className="contact-block-label">Телефон</div>
            <div className="contact-block-value">8 800 555-35-35</div>
            <div className="contact-block-sub">Бесплатно по России, пн–вс 9:00–21:00</div>
          </div>
        </div>

        <div className="contact-block">
          <div className="contact-block-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div>
            <div className="contact-block-label">Email</div>
            <div className="contact-block-value">info@autohub.ru</div>
            <div className="contact-block-sub">Ответим в течение 24 часов</div>
          </div>
        </div>

        <div className="contact-block">
          <div className="contact-block-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z"/></svg>
          </div>
          <div>
            <div className="contact-block-label">Telegram</div>
            <div className="contact-block-value">@autohub_support</div>
            <div className="contact-block-sub">Быстрые ответы и уведомления о тест-драйвах</div>
          </div>
        </div>

        <div className="contact-block">
          <div className="contact-block-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          </div>
          <div>
            <div className="contact-block-label">Главный офис</div>
            <div className="contact-block-value">Москва, ул. Автомобильная, 1</div>
            <div className="contact-block-sub">Пн–Сб 9:00–20:00, Вс 10:00–18:00</div>
          </div>
        </div>
    </div>
  </div>
);

export default ContactsPage;
