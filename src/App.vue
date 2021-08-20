<template>
  <div id="app">
    <navbar />
    <router-view />
    <!-- Modals -->
    <zone-modal></zone-modal>
    <account-modal></account-modal>
    <faq-modal></faq-modal>
    <zone-list-modal></zone-list-modal>
  </div>
</template>

<script>
import '@/assets/css/semantic.simplex.css'
import '@/assets/css/style.css'
import '@/assets/css/flag-css.css'
// import 'vue-nav-tabs/themes/vue-tabs.css'
import '../node_modules/izitoast/dist/css/iziToast.min.css'

import Navbar from '@/components/Navbar'
// Modals
import ZoneModal from '@/components/modals/ZoneModal'
import AccountModal from '@/components/modals/AccountModal'
import FaqModal from '@/components/modals/FaqModal'
import ZoneListModal from '@/components/modals/ZoneListModal'

import Zone from '@/api/Zone'
import MapABI from '@/abi/ETHMap.json'
import ZonesABI from '@/abi/ETHMapZones.json'
import LensABI from '@/abi/Lens.json'
import config from './config'
import Web3 from 'web3'

const networkConfig = {
  'live': {
    networkId: 1,
    contractAddress: config.contractAddressLive,
    wrapperAddress: config.wrapperAddressLive,
    lensAddress: config.lensAddressLive,
    fallback: `https://mainnet.infura.io/${config.infuraAPIKey}`
  },
  'ropsten': {
    networkId: 3,
    contractAddress: config.contractAddressRopsten,
    wrapperAddress: config.wrapperAddressLive,
    fallback: `https://ropsten.infura.io/${config.infuraAPIKey}`
  },
  'dev': {
    contractAddress: config.contractAddressDev,
    wrapperAddress: config.wrapperAddressLive,
    fallback: 'http://localhost:9545'
  }
}

let interval;

export default {
  components: {
    Navbar,
    ZoneModal,
    AccountModal,
    FaqModal,
    ZoneListModal
  },
  name: 'app',
  data () {
    return {
      network: 'live'
    }
  },
  methods: {
    setWeb3 () {
      let web3 = window.ethereum
      if (typeof web3 !== 'undefined') {
        console.log('Web3 injected browser: OK.')
        window.web3 = new Web3(web3)
      } else {
        console.log('Web3 injected browser: Fail.')
        window.web3 = new Web3(new Web3.providers.HttpProvider(networkConfig[this.network].fallback))
      }
      return window.web3
    },
    getContracts () {
      const MapContract = new window.web3.eth.Contract(MapABI, networkConfig[this.network].contractAddress)
      const ZoneContract = new window.web3.eth.Contract(ZonesABI, networkConfig[this.network].wrapperAddress)
      const LensContract = new window.web3.eth.Contract(LensABI, networkConfig[this.network].lensAddress)
      return {
        map: Object.freeze(MapContract),
        wrapper: Object.freeze(ZoneContract),
        lens: Object.freeze(LensContract)
      }
    },
    getWrapper () {
      const WrapperContract = new window.web3.eth.Contract(ZonesABI, networkConfig[this.network].wrapperAddress)
      return Object.freeze(WrapperContract)
    },
    getCurrentAddress () {
      return window.web3.eth.getAccounts()
        .then((addresses) => {
          const address = addresses[0]
          if (this.$store.getters.currentAddress !== address) {
            this.$store.dispatch('setCurrentAddress', address)
          }
          return address
        })
    },
    loadZones () {
      this.getZones()
    },
    getZones () {
      console.log(`Getting zones`)
      return this.$store.getters.lens.methods.getAllZones()
        .call()
        .then((_zones) => {
          const zones = _zones.map((_zone, id) => new Zone({
            id: id + 1,
            sellPrice: web3.utils.fromWei(_zone.sellPrice, 'ether'),
            pendingOwner: _zone.pendingOwner,
            status: _zone.status,
            owner: _zone.owner
          }))
          console.log(`Got ${_zones.length} zones`)
          console.log(_zones[0])
          this.$store.dispatch('addZones', zones)
        })
        .catch((err) => {
          // Most certainly because on wrong network
          this.$store.dispatch('setNetworkUnknown', true)
          this.$store.dispatch('setMapLoaded', true)
          console.log(err.message)
          return err
        })
    },
    getZone (id) {
      return this.$store.getters.lens.methods.getZone(id)
        .call()
        .then((_zone) => {
          console.log(`Loaded zone ${id}`)
          const zone = new Zone({
            id: id + 1,
            sellPrice: web3.utils.fromWei(_zone.sellPrice, 'ether'),
            pendingOwner: _zone.pendingOwner,
            status: _zone.status,
            owner: _zone.owner
          })
          this.$store.dispatch('addZone', zone)
        })
        .catch((err) => {
          // Most certainly because on wrong network
          this.$store.dispatch('setNetworkUnknown', true)
          this.$store.dispatch('setMapLoaded', true)
          console.log(err.message)
          return err
        })
    },
    connectWeb3 () {
      this.updateData()
      this.setUpdater()
    },
    updateData() {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(([account]) => {
          const contracts = this.getContracts()
          this.$store.dispatch('setContracts', contracts)
          this.$store.dispatch('setCurrentAddress', account)
            .then(() => this.loadZones())

        })
        .catch((error) => {
          if (error.code === 4001) {
            console.log('Please connect to MetaMask.');
          } else {
            console.error(error);
          }
        });
    },
    setUpdater () {
      if (interval) clearInterval(interval);
      setInterval(() => {
        this.getCurrentAddress()
      }, 5000)
    },
  },
  mounted () {
    this.setWeb3()
    this.connectWeb3()
  }
}
</script>

<style>
</style>
