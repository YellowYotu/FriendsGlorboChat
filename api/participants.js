export default async function handler(req, res) {
    // Разрешаем запросы
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url' });

    // Вытаскиваем код встречи из ссылки Google Meet
    const match = url.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
    if (!match) return res.status(400).json({ error: 'Invalid URL' });
    const meetingCode = match[1];

    // Ключ будет безопасно лежать в настройках хостинга
    const apiKey = process.env.GOOGLE_API_KEY; 

    try {
        // 1. Ищем ID активного звонка
        const recordUrl = `https://googleapis.com"${meetingCode}"&key=${apiKey}`;
        const recordResponse = await fetch(recordUrl);
        const recordData = await recordResponse.json();

        if (!recordData.conferenceRecords || recordData.conferenceRecords.length === 0) {
            return res.status(200).json({ count: 0 }); // Никого нет, звонок не начат
        }

        // Берем имя активной записи звонка
        const activeRecordName = recordData.conferenceRecords[0].name;

        // 2. Получаем список участников в этом звонке прямо сейчас
        const participantsUrl = `https://googleapis.com{activeRecordName}/participants?key=${apiKey}`;
        const participantsResponse = await fetch(participantsUrl);
        const participantsData = await participantsResponse.json();

        // Возвращаем фронтенду чистое число
        return res.status(200).json({ count: participantsData.totalSize || 0 });
    } catch (error) {
        return res.status(500).json({ error: 'Google API Error' });
    }
}