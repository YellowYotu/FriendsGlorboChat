export default async function handler(req, res) {
    // Разрешаем фронтенду делать запросы
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Секретные данные на сервере — теперь полностью в безопасности от блокировок хостинга
    const SECRET_PASSWORD = 'glorbo_2026_glorbo'; // Изменено на безопасный формат
    const PRIVATE_MEET_URL = 'https://meet.google.com/hed-addz-ssg'; 

    const { password } = req.query;

    if (password === SECRET_PASSWORD) {
        // Если пароль верный, отдаем ссылку
        return res.status(200).json({ success: true, url: PRIVATE_MEET_URL });
    } else {
        // Если неверный — отдаем ошибку
        return res.status(401).json({ success: false, error: 'Wrong password' });
    }
}
