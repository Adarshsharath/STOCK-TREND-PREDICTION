// Currency conversion utility
// Approximate USD to INR conversion rate (update as needed)
const USD_TO_INR = 83.5

export const convertToINR = (usdPrice) => {
  if (typeof usdPrice !== 'number' || isNaN(usdPrice)) return 0
  return usdPrice * USD_TO_INR
}

export const formatINR = (inrPrice) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(inrPrice)
}

export const formatPrice = (usdPrice) => {
  const inr = convertToINR(usdPrice)
  return formatINR(inr)
}

export const getCurrencySymbol = () => '₹'
