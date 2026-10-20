
/**
 * Formats a balance value to a string with two decimal places and Thai number formatting.
 * @param balance - The balance value to format.
 * @returns The formatted balance value as a string.
 */
const formatBalance = (balance: number | string): string => {
    const newBalanceFormat = Number(balance).toLocaleString('th-TH', {
      currency: 'THB',
    })
    return newBalanceFormat
  }

  const formatPhone = (value:any) => {
    return value.replace(/\D/g, ""); // ลบทุกอย่างที่ไม่ใช่ตัวเลข
  }
  
  /**
   * Retrieves the image URL from a dynamic URL.
   * If the URL contains 'drive.google.com', it extracts the image ID and returns the thumbnail URL.
   * Otherwise, it returns the original URL.
   *
   * @param url - The dynamic URL.
   * @returns The image URL.
   */
const getImageUrlFromDynamic = (
  url?: string | null
): string => {
  if (!url) return ''

  if (url.includes('drive.google.com')) {
    const match = url.match(/(?:id=|\/d\/)([^/?]+)/)
    if (match) {
      return `https://drive.google.com/thumbnail?id=${match[1]}`
    }
  }

  return url
}



  /**
   * Checks if a value is empty.
   * @param value - The value to check.
   * @returns True if the value is empty, false otherwise.
   */
  const isEmpty = (value: string | number | null | undefined): boolean => {
    if (value === null || value === undefined || value === '' || value === 'null') {
      return true
    }
    return false
  }
  
  const randomUniqueToken = () => [...Array(10)].map(() => (~~(Math.random() * 36)).toString(36)).join('')
  
  export { formatBalance, getImageUrlFromDynamic, isEmpty, randomUniqueToken,formatPhone };
  
  