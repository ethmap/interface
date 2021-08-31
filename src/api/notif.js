import iziToast from 'izitoast'

/**
 * Create a notification
 * @param {string} - Notification's message
 */
export const add = (options) => {
  iziToast.show({
    message: `${options.message}`,
    color: options.color,
    position: 'bottomCenter',
    timeout: 3000,
    transitionIn: 'bounceInUp',
    image: (options.image) ? options.image : ''
  })
}

/**
 * Create a success notification
 * @param {string} - Notification's message
 */
export const success = (message) => {
  add({
    color: 'green',
    message: `${message}`
  })
}

/**
 * Create an error notification
 * @param {string} - Notification's message
 */
export const error = (message) => {
  add({
    color: 'red',
    message: `${message}`
  })
}

/**
 * Create an Transaction denied notification
 * @param {string} - Notification's message
 */
export const transactionDenied = (erorMessage) => {
  if (erorMessage.includes('User denied transaction signature.')) {
    error(`Transaction signature denied`)
  }
}

export const transactionPending = (erorMessage) => {
  if (erorMessage.includes('Transaction was not mined within 50 blocks')) {
    add({
      color: 'yellow',
      message: `Transaction still pending, please check Etherscan and refresh page`
    })
  }
}

export const zoneBought = (zone) => {
  add({
    color: 'green',
    message: `<b>${zone.name}</b> bought !`,
    image: require(`@/assets/flags/${zone.code.toLowerCase()}.svg`)
  })
}

export const zoneSell = (zone, price) => {
  add({
    color: 'green',
    message: `<b>${zone.name}</b> on sale for ${price} Ξ !`,
    image: require(`@/assets/flags/${zone.code.toLowerCase()}.svg`)
  })
}

export const zoneXfer = (zone, to) => {
  add({
    color: 'green',
    message: `<b>${zone.name}</b> transferred to ${to.substring(0, 10)}... !`,
    image: require(`@/assets/flags/${zone.code.toLowerCase()}.svg`)
  })
}

export const zonePrepared = (zone) => {
  add({
    color: 'green',
    message: `<b>${zone.name}</b> prepared to wrap... !`,
    image: require(`@/assets/flags/${zone.code.toLowerCase()}.svg`)
  })
}

export const zonePrewrapped = (zone) => {
  add({
    color: 'green',
    message: `<b>${zone.name}</b> transferred to NFT contract... !`,
    image: require(`@/assets/flags/${zone.code.toLowerCase()}.svg`)
  })
}

export const zoneWrapped = (zone) => {
  add({
    color: 'green',
    message: `NFT claimed for <b>${zone.name}</b>... !`,
    image: require(`@/assets/flags/${zone.code.toLowerCase()}.svg`)
  })
}

export const zoneUnwrapped = (zone) => {
  add({
    color: 'green',
    message: `NFT unwrapped for <b>${zone.name}</b>... !`,
    image: require(`@/assets/flags/${zone.code.toLowerCase()}.svg`)
  })
}

export const zoneApproved = (zone) => {
  add({
    color: 'green',
    message: `<b>${zone.name}</b> prepared to migrate... !`,
    image: require(`@/assets/flags/${zone.code.toLowerCase()}.svg`)
  })
}

export const zoneMigrated = (zone) => {
  add({
    color: 'green',
    message: `<b>${zone.name}</b> migrated... !`,
    image: require(`@/assets/flags/${zone.code.toLowerCase()}.svg`)
  })
}