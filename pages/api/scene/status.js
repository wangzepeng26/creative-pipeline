export default function handler(req, res) {
  res.status(200).json({
    scene: 'ready',
    performance: {
      fps: 60,
      memory: 'optimal'
    }
  })
}