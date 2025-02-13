// 写一个UTC时间转北京时间的方法
export const utcToBeijing = (utcTime: string) => {
  const beijingTime = new Date(utcTime)
  return beijingTime.toLocaleString()
}


