import { LocalNotifications } from '@capacitor/local-notifications';

export const notifications = {
    show: async (id: number, title: string, body: string) => {
        try {
            const perm = await LocalNotifications.checkPermissions();
            if (perm.display !== 'granted') {
                await LocalNotifications.requestPermissions();
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id,
                        title,
                        body,
                        schedule: { at: new Date(Date.now() + 1000) },
                    },
                ],
            });
        } catch (error) {
            console.error('Notification failed:', error);
        }
    },
};