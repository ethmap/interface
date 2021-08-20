const state = {
  contract: null,
  wrapper: null,
  lens: null,
  currentAddress: null,
  mapLoaded: false,
  networkUnknown: false,
  zones: []
}

// getters
const getters = {
  app: state => state,
  contract: state => state.contract,
  wrapper: state => state.wrapper,
  lens: state => state.lens,
  currentAddress: state => state.currentAddress,
  mapLoaded: state => state.mapLoaded,
  networkUnknown: state => state.networkUnknown,
  zones: state => state.zones
}

// actions
const actions = {
  setContracts ({ commit, state }, contracts) {
    commit('setContracts', contracts)
  },
  setCurrentAddress ({ commit, state }, currentAddress) {
    commit('setCurrentAddress', currentAddress)
  },
  addZone ({ commit, state }, zone) {
    commit('addZone', zone)
  },
  addZones ({ commit, state }, zones) {
    commit('addZones', zones)
  },
  setMapLoaded ({ commit, state }, status) {
    commit('setMapLoaded', status)
  },
  setNetworkUnknown ({ commit, state }, status) {
    commit('setNetworkUnknown', status)
  }
}

// mutations
const mutations = {
  setContracts (state, contracts) {
    state.contract = contracts.map
    state.wrapper = contracts.wrapper
    state.lens = contracts.lens
  },
  setCurrentAddress (state, currentAddress) {
    state.currentAddress = currentAddress
  },
  addZone (state, zone) {
    state.zones.push(zone)
  },
  addZones (state, zones) {
    state.zones.push(...zones)
  },
  setMapLoaded (state, status) {
    state.mapLoaded = status
  },
  setNetworkUnknown (state, status) {
    state.networkUnknown = status
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
