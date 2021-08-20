import store from '../store'
// import config from '../config'
import BigNumber from 'bignumber.js'

const Statuses = [
  'base',
  'wrap_pending',
  'wrap_ready',
  'wrapped'
]

class Zone {
  constructor (data) {
    this.id = data.id
    this.status = Statuses[+(data.status.toString())]
    this.pendingOwner = data.pendingOwner
    this.name = data.name
    this.code = data.code
    this.owner = data.owner
    this.sellPrice = data.sellPrice
  }

  static getById (id) {
    return store.getters.zones.find(c => c.id === id)
  }

  isOwner () {
    return (this.owner === store.getters.currentAddress)
  }

  isWrapped() {
    return this.status === 'wrapped'
  }

  isWrappable() {
    return this.canPrepare() || this.isPrepared() || this.isReady()
  }

  canPrepare() {
    return this.isOwner() && !this.isWrapped() && (this.pendingOwner === '0x0000000000000000000000000000000000000000')
  }

  isPrepared() {
    return this.status === 'wrap_pending' &&
      this.pendingOwner === store.getters.currentAddress
  }

  isReady() {
    return this.status === 'wrap_ready' &&
      this.pendingOwner === store.getters.currentAddress &&
      this.owner == store.getters.wrapper.options.address
  }

  openSeaLink() {
    return `https://opensea.io/assets/0x7372d7fb769470ff57019404cbf6bc6515e39090/${this.id}`
  }

  hasOwner () {
    return this.owner != '0x0000000000000000000000000000000000000000'
  }

  onSale () {
    return this.sellPrice !== '0'
  }

  isInitialSale () {
    return !this.hasOwner()
  }

  getRequiredPrice () {
    if (this.isInitialSale()) return this.initialPrice()
    return this.sellPrice
  }

  initialPrice () {
    const initPrice = (0.001 + ((this.id - 1) * (0.001 / 2)))
    return new BigNumber(initPrice.toPrecision(6)).round(6).toNumber()
  }

  zoneKeyFill () {
    if (this.isOwner()) {
      if (this.onSale()) return 'OWNER_SALE'
      if (this.isPrepared() || this.isReady()) return 'PENDING_OWNER'
      return 'OWNER'
    }
    if (this.onSale()) return 'AVAILABLE'
    if (this.isWrapped()) return 'OPENSEA'
    return 'NOT_AVAILABLE'
  }
}

export default Zone
