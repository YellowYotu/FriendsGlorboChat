export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const SECRET_PASSWORD = 'glorbo_1488_glorbo';
    const PRIVATE_MEET_URL = 'https://meet.google.com/hed-addz-ssg';
    const { password } = req.query;

    if (password === SECRET_PASSWORD) {
        return res.status(200).json({ success: true, url: PRIVATE_MEET_URL });
    } else {
        return res.status(401).json({ success: false, error: 'Wrong password' });
    }
}
