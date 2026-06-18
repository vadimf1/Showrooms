const ru = (n: number, one: string, few: string, many: string) =>
  n % 10 === 1 && n % 100 !== 11 ? one
  : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few
  : many;

export const cityWord   = (n: number) => ru(n, 'город', 'города', 'городов');
export const dealerWord = (n: number) => ru(n, 'шоурум', 'шоурума', 'шоурумов');
export const stockWord  = (n: number) => ru(n, 'автомобиль', 'автомобиля', 'автомобилей');
export const bodyWord   = (n: number) => ru(n, 'кузов', 'кузова', 'кузовов');
export const reviewWord = (n: number) => ru(n, 'отзыв', 'отзыва', 'отзывов');
export const autoWord   = (n: number) => ru(n, 'автомобиль', 'авто', 'авто');
