export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    const match = url.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
    if (!match) return res.status(400).json({ error: 'Invalid Google Meet URL' });
    const meetingCode = match[1];

    const apiKey = process.env.GOOGLE_API_KEY; 
    if (!apiKey) return res.status(500).json({ error: 'API key is not configured on Vercel' });

    try {
        const recordUrl = `https://googleapis.com"${meetingCode}"&key=${apiKey}`;
        const recordResponse = await fetch(recordUrl);
        
        if (!recordResponse.ok) {
            return res.status(200).json({ count: 0 });
        }
        
        const recordData = await recordResponse.json();

        if (!recordData.conferenceRecords || recordData.conferenceRecords.length === 0) {
            return res.status(200).json({ count: 0 });
        }

        const activeRecordName = recordData.conferenceRecords.name;

        const participantsUrl = `https://googleapis.com{activeRecordName}/participants?key=${apiKey}`;
        const participantsResponse = await fetch(participantsUrl);
        
        if (!participantsResponse.ok) {
            return res.status(200).json({ count: 0 });
        }
        
        const participantsData = await participantsResponse.json();
        return res.status(200).json({ count: participantsData.totalSize || 0 });

    } catch (error) {
        return res.status(200).json({ count: 0 });
    }
}
