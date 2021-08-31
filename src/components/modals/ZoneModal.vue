<template>
  <modal
    name="zoneModal"
    height="auto"
    @before-open="beforeOpen"
    @closed="closed"
    :adaptive="true">
      <div class="container zone-modal"
        v-if="zone">
        <!-- Header -->
        <h2 class="ui header center aligned">
          <a href="" class="ui sub header right floated" @click.prevent="closeModal()"><i class="fa fa-times"></i></a>
          <span :class="`flag flag-${zone.code.toLowerCase()}`"></span> {{ zone.name }}
          <div v-if="zone.hasOwner()" class="ui sub header"
               data-tooltip="Current owner" data-inverted="" data-position="bottom center">
            <span>#{{ zone.id }}</span>
            <i style="padding-left: 10px;" class="fa fa-user"></i> <a :href="`https://etherscan.io/address/${zone.owner}`" target="_blank"> {{ zone.owner }}</a>
          </div>
        </h2>
        <!-- Zone not on sale -->
        <div v-if="!zone.onSale() && !zone.isOwner()" class="ui container message owned-message center aligned">
          <p><span :class="`flag flag-${zone.code.toLowerCase()}`"></span> <b>{{ zone.name }}</b> is currently owned by <b>{{ zone.owner }}</b></p>
        </div>
        <!-- Zone Owner -->
        <!-- -->
        <div v-if="zone.isOwner()" class="ui container">
          <div class="ui container center aligned message owner-message"
               :class="{ 'owner-sale-message': zone.onSale() }">
            <p>You own <span :class="`flag flag-${zone.code.toLowerCase()}`"></span> <b>{{ zone.name }}</b>.
            <span v-if="zone.onSale()"><br />Listed on sale for {{ zone.sellPrice }} Ξ</span></p>
          </div>
          <!-- Menu -->
          <div :class="`ui ${
            zone.needsMigration() ? 'three' : 'two'
          } item menu`">
            <a v-if="!zone.isWrapped()" class="item" :class="{ 'active' : panel === 'sell' }"
               @click.prevent="switchPanel('sell')">
              <i class="fa fa-money"></i> Sell
            </a>
            <a v-if="zone.isWrapped()" class="item" :class="{ 'active' : panel === 'sell' }"
               @click.prevent="switchPanel('unwrap')">
              <i class="fa fa-money"></i> Unwrap
            </a>
            <a class="item" :class="{ 'active' : panel === 'xfer' }"
               @click.prevent="switchPanel('xfer')">
              <i class="fa fa-exchange"></i> Transfer
            </a>
          </div>
          <!-- Unwrap panel -->
          <form v-if="panel === 'unwrap'" class="ui form">
            <!-- Unwrap actions -->
            <div v-if="!txWait" class="ui segment basic center aligned">
              <button class="ui green button"
                      @click.prevent="confirmUnwrap()">
                <i class="fa fa-check"></i>
                Confirm
              </button>
            </div>
          </form>
          <!-- Sell panel -->
          <form v-if="panel === 'sell'" class="ui form">
            <div class="field">
              <label>Sell price</label>
              <div class="ui right labeled input">
                <input class="ui input" type="number" v-model="sellPrice" name="sellPrice" placeholder="Enter price" autocomplete="off">
                <div class="ui label">
                  Ξ
                </div>
              </div>
            </div>
            <!-- Sell actions -->
            <div v-if="!txWait" class="ui segment basic center aligned">
              <button class="ui green button"
                      :class="{ 'disabled': sellPrice <= 0 }"
                      @click.prevent="confirmSell()">
                <i class="fa fa-check"></i>
                Confirm
              </button>
            </div>
          </form>
          <!-- Xfer panel -->
          <form v-if="panel === 'xfer'" class="ui form">
            <div class="field">
              <label>Recipient address</label>
              <div class="ui input">
                <input class="ui input" type="text" v-model="xferAddress" name="xferAddress" placeholder="Enter recipient address">
              </div>
            </div>
            <!-- Xfer actions -->
            <div v-if="!txWait" class="ui segment basic center aligned">
              <button class="ui green button"
                      :class="{ 'disabled': !xferValid }"
                      @click.prevent="confirmXfer()">
                <i class="fa fa-check"></i>
                Confirm
              </button>
            </div>
          </form>
        </div>

        <!-- Migrate panel -->
        <div v-if="zone.isMigratable()">
          <div class="ui segment basic center aligned" style="margin-bottom: 0em;">
            <h3 class="ui header">
              <i class="fa fa-tag"></i> Migrate Zone
            </h3>
            <p>You own this zone, but it must be migrated to be fully compatible with OpenSea.</p>
            <!-- Step 1 Actions -->
            <div v-if="!txWait && zone.canApproveMigrate()" class="ui segment basic center aligned" style="margin-top: 0em;">
              <div class="ui container" style="margin-bottom: 0.75em;">
                Step 1/2: Approve migration of <span :class="`flag flag-${zone.code.toLowerCase()}`"></span> NFT.
              </div>
              <button class="ui green button" @click.prevent="confirmApproveMigrate()">
                <i class="fa fa-check"></i>
                Confirm
              </button>
              <button class="ui basic button"
                @click.prevent="closeModal()">
                <i class="fa fa-times"></i>
                Cancel
              </button>
            </div>

            <!-- Step 2 Actions -->
            <div v-if="!txWait && zone.migrateReady()" class="ui segment basic center aligned" style="margin-top: 0em;">
              <div class="ui container" style="margin-bottom: 0.75em;">
                Step 2/2: Migrate <span :class="`flag flag-${zone.code.toLowerCase()}`"></span> to new wrapper.
              </div>
              <button class="ui green button" @click.prevent="confirmMigrate()">
                <i class="fa fa-check"></i>
                Confirm
              </button>
              <button class="ui basic button"
                @click.prevent="closeModal()">
                <i class="fa fa-times"></i>
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Wrap panel -->
        <div v-if="zone.isWrappable()">
          <div class="ui segment basic center aligned" style="margin-bottom: 0em;">
            <h3 class="ui header">
              <i class="fa fa-tag"></i> Wrap Zone
            </h3>
            <p>You own this zone, but it must be wrapped to be compatible with OpenSea.</p>
            <!-- Step 1 Actions -->
            <div v-if="!txWait && zone.canPrepare()" class="ui segment basic center aligned" style="margin-top: 0em;">
              <div class="ui container" style="margin-bottom: 0.75em;">
                Step 1/3: Prepare <span :class="`flag flag-${zone.code.toLowerCase()}`"></span> to wrap as an NFT.
              </div>
              <button class="ui green button" @click.prevent="confirmPrepare()">
                <i class="fa fa-check"></i>
                Confirm
              </button>
              <button class="ui basic button"
                @click.prevent="closeModal()">
                <i class="fa fa-times"></i>
                Cancel
              </button>
            </div>

            <!-- Step 2 Actions -->
            <div v-if="!txWait && zone.isPrepared()" class="ui segment basic center aligned" style="margin-top: 0em;">
              <div class="ui container" style="margin-bottom: 0.75em;">
                Step 2/3: Transfer <span :class="`flag flag-${zone.code.toLowerCase()}`"></span> to NFT contract.
              </div>
              <button class="ui green button" @click.prevent="confirmWrapTransfer()">
                <i class="fa fa-check"></i>
                Confirm
              </button>
              <button class="ui basic button"
                @click.prevent="closeModal()">
                <i class="fa fa-times"></i>
                Cancel
              </button>
            </div>

            <!-- Step 3 Actions -->
            <div v-if="!txWait && zone.isReady()" class="ui segment basic center aligned" style="margin-top: 0em;">
              <div class="ui container" style="margin-bottom: 0.75em;">
                Step 3/3: Claim <span :class="`flag flag-${zone.code.toLowerCase()}`"></span> NFT.
              </div>
              <button class="ui green button" @click.prevent="confirmWrapClaim()">
                <i class="fa fa-check"></i>
                Confirm
              </button>
              <button class="ui basic button"
                @click.prevent="closeModal()">
                <i class="fa fa-times"></i>
                Cancel
              </button>
            </div>
          </div>
        </div>
        <!-- Buy Form -->
        <div class="ui segment basic center aligned" style="margin-bottom: 0em;" v-if="zone.isWrapped()">
          <!-- <h2>OpenSea</h2> -->
          <a :href="zone.openSeaLink()" title="View on OpenSea" target="_blank">
            <img
              style="width:220px; border-radius:5px; box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.25);"
              src="https://storage.googleapis.com/opensea-static/Logomark/Badge%20-%20Available%20On%20-%20Light.png"
              alt="Available on OpenSea"
            />
          </a>
        </div>
        <!-- -->
        <div v-if="!zone.isOwner() && zone.onSale() && !zone.isWrapped()">
          <!-- Details -->
          <div class="ui segment basic center aligned" style="margin-bottom: 0em;">
              <h3 class="ui header">
                <i class="fa fa-tag"></i> {{ zone.getRequiredPrice() }} Ξ
              </h3>
          </div>
          <!-- MetaMask warning -->
          <div v-if="zoneNonBuyable" class="ui container yellow message center aligned">
            You need <b>MetaMask</b> unlocked to buy <span :class="`flag flag-${zone.code.toLowerCase()}`"></span> <b>{{ zone.name }}</b>
          </div>
          <!-- Actions -->
          <div v-if="!txWait" class="ui segment basic center aligned" style="margin-top: 0em;">
            <div v-if="!zoneNonBuyable" class="ui container" style="margin-bottom: 0.75em;">
              Become owner of <span :class="`flag flag-${zone.code.toLowerCase()}`"></span> 
              <b>{{ zone.name }}</b> for <b>{{ zone.getRequiredPrice() }}</b> Ξ ?
            </div>
            <button class="ui green button"
                    :class="{ 'disabled': zoneNonBuyable }"
                    @click.prevent="confirmBuy()">
              <i class="fa fa-check"></i>
              Confirm
            </button>
            <button class="ui basic button"
              @click.prevent="closeModal()">
              <i class="fa fa-times"></i>
              Cancel
            </button>
          </div>
        </div>
        <!-- Tx wait -->
        <div v-if="txWait" class="ui segment basic center aligned">
          <hr />
          <h2 class="ui header">
            <i class="fa fa-circle-o-notch fa-spin"></i> Waiting for MetaMask
          </h2>
          <h3 class="ui subheader">You can close this window when transaction has been submitted</h3>
        </div>
      </div>
  </modal>
</template>

<script>
import Zone from '@/api/Zone'
import * as notif from '@/api/notif'

export default {
  name: 'zoneModal',
  data () {
    return {
      panel: null,
      sellPrice: 0,
      xferAddress: '',
      zone: null,
      txWait: false
    }
  },
  computed: {
    contract () {
      return this.$store.getters.contract
    },
    wrapper () {
      return this.$store.getters.wrapper
    },
    oldWrapper () {
      return this.$store.getters.oldWrapper
    },
    currentAddress () {
      return this.$store.getters.currentAddress
    },
    currentPrice () {
      return this.zone.initialPrice()
    },
    zoneNonBuyable () {
      return (!window.web3.currentProvider.isMetaMask || !this.$store.getters.currentAddress)
    },
    xferValid () {
      return web3.utils.isAddress(this.xferAddress)
    }
  },
  methods: {
    switchPanel (panel) {
      if (this.panel === panel) this.panel = null
      else this.panel = panel
    },
    confirmBuy () {
      /* globals web3 */
      this.txWait = true
      const zoneId = this.zone.id
      let price = this.zone.getRequiredPrice()
      price = web3.utils.toWei(price.toString(), 'ether')
      return this.contract.methods.buyZone(zoneId)
        .send({ from: this.currentAddress, value: price })
        .then((res) => {
          let zone = Zone.getById(zoneId)
          zone.sellPrice = '0'
          zone.owner = this.currentAddress
          this.txWait = false
          notif.zoneBought(zone)
          this.closeModal()
        })
        .catch((err) => {
          if (err) {
            notif.transactionDenied(err.message)
            notif.transactionPending(err.message)
            this.txWait = false
            console.log(err.message)
          }
        })
    },
    confirmApproveMigrate() {
      this.txWait = true
      const zoneId = this.zone.id
      return this.oldWrapper.methods.approve(this.wrapper.options.address, zoneId)
        .send({ from: this.currentAddress })
        .then(() => {
          let zone = Zone.getById(zoneId)
          zone.status = 'migrate_ready'
          this.txWait = false
          notif.zoneApproved(zone)
          this.closeModal()
        })
        .catch((err) => {
          if (err) {
            notif.transactionDenied(err.message)
            notif.transactionPending(err.message)
            this.txWait = false
            console.log(err.message)
          }
        })
    },
    confirmMigrate() {
      this.txWait = true
      const zoneId = this.zone.id
      return this.wrapper.methods.migrate(zoneId)
        .send({ from: this.currentAddress })
        .then(() => {
          let zone = Zone.getById(zoneId)
          zone.status = 'wrapped'
          this.txWait = false
          notif.zoneMigrated(zone)
          this.closeModal()
        })
        .catch((err) => {
          if (err) {
            notif.transactionDenied(err.message)
            notif.transactionPending(err.message)
            this.txWait = false
            console.log(err.message)
          }
        })
    },
    confirmSell () {
      /* globals web3 */
      this.txWait = true
      const zoneId = this.zone.id
      let price = this.sellPrice
      let priceWei = web3.utils.toWei(price.toString(), 'ether')
      return this.contract.methods.sellZone(zoneId, priceWei)
        .send({ from: this.currentAddress })
        .then((res) => {
          let zone = Zone.getById(zoneId)
          zone.sellPrice = price
          this.txWait = false
          notif.zoneSell(zone, price)
          this.closeModal()
        })
        .catch((err) => {
          if (err) {
            notif.transactionDenied(err.message)
            notif.transactionPending(err.message)
            this.txWait = false
            console.log(err.message)
          }
        })
    },
    confirmXfer () {
      /* globals web3 */
      if (!this.xferValid) return false
      this.txWait = true
      const zoneId = this.zone.id
      let tx;
      if (this.zone.isWrapped()) {
        tx = this.wrapper.methods.transferFrom(this.currentAddress, this.xferAddress, zoneId)
      } else {
        tx = this.contract.methods.transferZone(zoneId, this.xferAddress)
      }
      return tx
        .send({ from: this.currentAddress })
        .then((res) => {
          let zone = Zone.getById(zoneId)
          zone.owner = this.xferAddress
          this.txWait = false
          notif.zoneXfer(zone, zone.owner)
          this.closeModal()
        })
        .catch((err) => {
          if (err) {
            notif.transactionDenied(err.message)
            notif.transactionPending(err.message)
            this.txWait = false
            console.log(err.message)
          }
        })
    },
    confirmPrepare() {
      this.txWait = true
      const zoneId = this.zone.id
      return this.wrapper.methods.prepareToWrapZone(zoneId)
        .send({ from: this.currentAddress })
        .then(() => {
          let zone = Zone.getById(zoneId)
          zone.pendingOwner = this.currentAddress
          zone.status = 'wrap_pending'
          this.txWait = false
          notif.zonePrepared(zone)
          this.closeModal()
        })
        .catch((err) => {
          if (err) {
            notif.transactionDenied(err.message)
            notif.transactionPending(err.message)
            this.txWait = false
            console.log(err.message)
          }
        })
    },
    confirmWrapTransfer() {
      this.txWait = true
      const zoneId = this.zone.id
      return this.contract.methods.transferZone(zoneId, this.wrapper.options.address)
        .send({ from: this.currentAddress })
        .then(() => {
          let zone = Zone.getById(zoneId)
          zone.owner = this.wrapper.options.address
          zone.status = 'wrap_ready'
          this.txWait = false
          notif.zonePrewrapped(zone)
          this.closeModal()
        })
        .catch((err) => {
          if (err) {
            notif.transactionDenied(err.message)
            notif.transactionPending(err.message)
            this.txWait = false
            console.log(err.message)
          }
        })
    },
    confirmWrapClaim() {
      this.txWait = true
      const zoneId = this.zone.id
      return this.wrapper.methods.wrapZone(zoneId)
        .send({ from: this.currentAddress })
        .then(() => {
          let zone = Zone.getById(zoneId)
          zone.owner = this.currentAddress
          zone.status = 'wrapped'
          zone.pendingOwner = '0x0000000000000000000000000000000000000000'
          this.txWait = false
          notif.zoneWrapped(zone)
          this.closeModal()
        })
        .catch((err) => {
          if (err) {
            notif.transactionDenied(err.message)
            notif.transactionPending(err.message)
            this.txWait = false
            console.log(err.message)
          }
        })
    },
    confirmUnwrap() {
      this.txWait = true
      const zoneId = this.zone.id
      return this.wrapper.methods.unwrapZone(zoneId)
        .send({ from: this.currentAddress })
        .then(() => {
          let zone = Zone.getById(zoneId)
          zone.owner = this.currentAddress
          zone.status = 'base'
          this.txWait = false
          notif.zoneUnwrapped(zone)
          this.closeModal()
        })
        .catch((err) => {
          if (err) {
            notif.transactionDenied(err.message)
            notif.transactionPending(err.message)
            this.txWait = false
            console.log(err.message)
          }
        })
    },
    closeModal () {
      this.$modal.hide('zoneModal')
    },
    beforeOpen (event) {
      this.zone = event.params.zone
      if (this.zone.isOwner() && this.zone.onSale()) {
        this.sellPrice = this.zone.sellPrice
      }
    },
    closed (event) {
      this.zone = null
      this.txWait = false
      this.sellPrice = 0
      this.panel = null
      this.xferAddress = ''
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
.zone-modal {
  padding: 1.5em;
}
.owner-message {
  background-color: rgba(252, 222, 156, 0.2);
  border-color: rgba(252, 222, 156, 1);
}
.owner-sale-message {
  background-color: rgba(255, 136, 17, 0.15);
  border-color: rgba(255, 136, 17, 0.75);
}
.owned-message {
  background-color: rgba(230, 57, 70, 0.15);
  border-color: rgba(230, 57, 70, 0.75);
}

a.item  {
  color: #222222 !important;
}
.active.item {
  background-color: #f3f3f3 !important;
}
</style>
