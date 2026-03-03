export default function handler(req, res) {
  res.json({ message: 'API is working!', env: process.env.NODE_ENV })
}
