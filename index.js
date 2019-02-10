require('babel-polyfill')
const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default
const Xrp = require('@ledgerhq/hw-app-xrp').default
const RippleBinaryCodec = require('ripple-binary-codec')
const RippleAPI = require('ripple-lib').RippleAPI

const api = new RippleAPI({ server: 'wss://s1.ripple.com:443' });

const signTransaction = async settings => {
	const transport = await TransportNodeHid.create();
	const xrp = new Xrp(transport);

	let address, tx

	try {
		xrpAddress = await xrp.getAddress("44'/144'/0'/0/0")
		address = xrpAddress.address

		console.log(`Using ${address} address.`)
	} catch (error) {
		console.error('Error getting address from Ledger', error)

		return
	}

	try {
		await api.connect()

		const prepared = await api.prepareSettings(address, settings)
		tx = JSON.parse(prepared.txJSON)

		console.log('Generated TX JSON', tx)
	} catch (error) {
		console.error('Error preparing settings', error)

		return
	}

	try {
		const encodedTx = RippleBinaryCodec.encodeForSigning(tx)

		const signature = await xrp.signTransaction("44'/144'/0'/0/0", encodedTx);

		console.log(`Signature: ${signature}`)

		const result = await api.submit(signature)

		console.log('Tx submitted', result)
	} catch (error) {
		console.error('Error signing transaction', error)
	}

	process.exit()
}

signTransaction({
	requireDestinationTag: true
})
