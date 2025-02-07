import crypto from 'crypto';

function generateUniqueId(service_id: string, service_name: string): string {
    const currentDate: string = new Date().toISOString(); // Берем текущее время

    const elements: string[] = [service_id, service_name, currentDate]; // Создаем массив из элементов пользователя
    const shuffled: string[] = shuffleArray(elements);
    const combinedString = shuffled.join('-');

    const hash: string = crypto
        .createHash('sha256')
        .update(combinedString)
        .digest('hex');

    return hash;
}

function shuffleArray(array: string[]): string[] {
    const shuffled: string[] = [...array];
    for (let i = shuffled.length; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1)); // Рандомный индекс от 0 до i
        [shuffled[i], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[i],
        ];
    }

    return shuffled;
}

export default generateUniqueId;
