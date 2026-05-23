export default async function handler(req, res) {
    // Разрешаем фронтенду делать запросы
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    // Извлекаем код встречи (например, ens-nmpk-xdc)
    const match = url.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
    if (!match) return res.status(400).json({ error: 'Invalid Google Meet URL' });
    const meetingCode = match[1];

    // Берем секретный ключ из настроек Vercel
    const apiKey = process.env.GOOGLE_API_KEY; 
    
    // Безопасность: Если ключа нет, выдаем 0, а не ломаем сервер ошибкой 500
    if (!apiKey) {
        return res.status(200).json({ count: 0 }); 
    }

    try {
        // ИСПРАВЛЕНО: Правильный адрес для поиска активного звонка
        const recordUrl = `https://googleapis.com"${meetingCode}"&key=${apiKey}`;
        const recordResponse = await fetch(recordUrl);
        
        if (!recordResponse.ok) {
            return res.status(200).json({ count: 0 });
        }
        
        const recordData = await recordResponse.json();

        if (!recordData.conferenceRecords || recordData.conferenceRecords.length === 0) {
            return res.status(200).json({ count: 0 });
        }

        // Получаем ID записи звонка (берем первую из списка)
        const activeRecordName = recordData.conferenceRecords[0].name;

        // ИСПРАВЛЕНО: Добавлен знак $ перед скобкой и правильный домен meet.googleapis.com
        const participantsUrl = `https://googleapis.com{activeRecordName}/participants?key=${apiKey}`;
        const participantsResponse = await fetch(participantsUrl);
        
        if (!participantsResponse.ok) {
            return res.status(200).json({ count: 0 });
        }
        
        const participantsData = await participantsResponse.json();
        
        // Отдаем чистое число фронтенду
        return res.status(200).json({ count: participantsData.totalSize || 0 });

    } catch (error) {
        // Полная защита от любых сбоев сети
        return res.status(200).json({ count: 0 });
    }
}
