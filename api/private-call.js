export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Секретные данные, которые будут храниться НА СЕРВЕРЕ. Через F12 их увидеть невозможно!
    const SECRET_PASSWORD = 'glorbo_1488_glorbo';
    const PRIVATE_MEET_URL = 'https://meet.google.com/hed-addz-ssg'; // Ваша секретная ссылка

    const { password } = req.query;

    if (password === SECRET_PASSWORD) {
        // Если пароль верный, отдаем ссылку
        return res.status(200).json({ success: true, url: PRIVATE_MEET_URL });
    } else {
        // Если неверный — отдаем ошибку
        return res.status(401).json({ success: false, error: 'Wrong password' });
    }
}
