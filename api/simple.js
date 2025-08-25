export default function handler(request, response) {
  return response.status(200).json({
    message: 'Simple API works!',
    method: request.method,
    timestamp: new Date().toISOString(),
    success: true
  })
}