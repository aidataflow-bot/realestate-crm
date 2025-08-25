export default function handler(req, res) {
  return res.status(200).json({ message: 'API Works!', time: new Date().toISOString() })
}