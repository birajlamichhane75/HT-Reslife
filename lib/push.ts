import webpush from 'web-push'

const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  try {
    // Only set VAPID details if they aren't placeholder strings
    if (!vapidKeys.publicKey.includes('<<<REPLACE')) {
      webpush.setVapidDetails(
        'mailto:housing@htu.edu',
        vapidKeys.publicKey,
        vapidKeys.privateKey
      )
    }
  } catch (error) {
    console.warn('Failed to set VAPID details:', error)
  }
}

export async function sendPushNotification(
  subscription: any,
  payload: { title: string; body: string; url?: string }
): Promise<boolean> {
  try {
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      console.warn('VAPID keys not configured. Skipping push notification.')
      return false
    }
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    )
    return true
  } catch (error: any) {
    console.error('Error sending web push notification:', error)
    // If subscription is expired/invalid, we could remove it in caller
    return false
  }
}
