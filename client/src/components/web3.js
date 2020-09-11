import Portis from '@portis/web3'
import Web3 from 'web3'

const portis = new Portis('0ae18a7d-9dfa-4fd0-80c8-5819428ce3df', 'maticMumbai')

const web3 = new Web3(portis.provider, "https://rpc-mumbai.matic.today")

export default web3;