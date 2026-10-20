const sumAll = (item: any, key: string) => {
    let sum = 0
    item.forEach((value: any) => {
      sum += Number(value[key])
    })
    return sum
  }

  export {sumAll}