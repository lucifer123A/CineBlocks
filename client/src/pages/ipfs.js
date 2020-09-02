const IpfsHttpClient = require('ipfs-http-client')
// const {urlSource} = IpfsHttpClient
const ipfs = new IpfsHttpClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

// const f = {
//     ipfs: ipfs,
//     urlSource: urlSource
// }
export default ipfs;