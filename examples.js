const GWEI = 1000000000;
const ETHER = 1000000000000000000;



 /**
  * Create web3 contract object with ABI and binary EVM code
  * @param {Array} abi abi interfaces of the contract
  * @param {string} bin binary code of the contract
  * @returns {Object} web3 contract object
  */
 function createContract (abi, bin) {
    let contract = new web3.eth.Contract(abi, {data: bin});
    return contract;
}



/**
 * This is a more concise way to send transaction,
 * if the sender's account is not in the wallet.
 * @param {Object} fromAccount web3 account object
 * @param {string} toAddress web3 account object
 * @param {(BigNumber|number|string)} [value=0]
 * @param {(number|string)} [nonce=0] 
 * @param {(number|string)} [gas=27000] 
 * @param {string} [data='']
 */ 
// function sendTx  (fromAccount, toAddress, value = 0, nonce = 0, gas = 27000, data = '') {
//     web3.eth.sendTransaction({
//         from: fromAccount.address,
//         to: toAddress,
//         gas: gas,
//         value: value,
//         data: data
//     })
//     .on('transactionHash', hash => {
//         console.log('TX hash: ' + hash);
//     })
//     .on('receipt', receipt => {
//         console.log(receipt);
//     })
//     .on('error', console.error);
// }



/**
 * This is a more general way to send transaction,
 * if the sender's account is not in the wallet.
 * @param {Object} fromAccount web3 account object
 * @param {string} toAddress web3 account object
 * @param {(BigNumber|number|string)} [value=0]
 * @param {(number|string)} [nonce=0] 
 * @param {(number|string)} [gas=27000] 
 * @param {string} [data='']
 */ 
function sendTx (fromAccount, toAddress, value = 0, nonce = 0, gas = 27000, data = '') {
    web3.eth.getTransactionCount(fromAccount.address)
    .then( result => {
        let tx = {
            nonce:    nonce < result ? result : nonce,
            gasPrice: GWEI, 
            gasLimit: gas,
            to:       toAddress, 
            value:    value._isBigNumber ? value : value.toString(),
            data:     data
        }
        web3.eth.accounts.signTransaction(tx, fromAccount.privateKey)
        .then( signedTx => {
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on('transactionHash', hash => {
              console.log('TX hash: ' + hash);
              //console.log('TX hash: ' + web3.utils.sha3(signedTx.rawTransaction));
            })
            .on('receipt', receipt => {
              console.log(receipt);
            })
            //.on('confirmation', (confirmationNumber, receipt) => {
            //   console.log('TX confirmation: ' + confirmationNumber);
            //})
            .on('error', console.error);
        })
        .catch( e => console.log(e))
    })
}



/**
 * This is a more concise way to deploy contract, 
 * if the sender's account is added in the wallet.
 * @param {Object} fromAccount web3 account object
 * @param {Object} contract web3 contract object
 * @param {array} [args=[]] 
 */  
// function deployContract (fromAccount, contract, args=[]) {
//     contract.deploy({
//         data: contract.options.data,
//         arguments: args
//     })
//     .estimateGas( (err, gas) => {
//         console.log(gas);
//         gas = gas + 210000; //add a little bit more to the estimated Gas
//         contract.deploy({
//             arguments: [123]
//         }).send({
//             from: fromAccount.address,
//             gas: gas.toString(),
//             gasPrice: GWEI
//         })
//         .on('transactionHash', hash => {
//             console.log('TX hash: ' + hash);
//         })
//         .on('receipt', receipt => {
//             console.log(receipt);
//         })
//         .on('error', console.error)
//         .then(function(newContractInstance){
//             console.log(newContractInstance.options.address) // instance with the new contract address
//             contract.options.address = newContractInstance.options.address;
//         })
//     })
//     .catch (console.log)
// } 



/**
 * This is a more general way to deploy contract, 
 * if the sender's account is not in the wallet.
 * @param {Object} fromAccount web3 account object
 * @param {Object} contract web3 contract object
 * @param {array} [args=[]] 
 */  
function deployContract (fromAccount, contract, args=[]) {
    contract.deploy({
        data: contract.options.data,
        arguments: args
    })
    .estimateGas( (err, gas) => {
        console.log(gas);
        gas = gas + 210000; //add a little bit more to the estimated Gas
        let tx = {
            nonce: nonce,
            gasPrice: GWEI,
            gasLimit: gas,
            to: "",
            value: "0",
            data: contract.options.data
        }
        web3.eth.accounts.signTransaction(tx, fromAccount.privateKey)
        .then(signedTx => {
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on('transactionHash', hash => {
                console.log('TX hash: ' + hash);
            })
            .on('receipt', receipt => {
                console.log(receipt);
                contract.options.address = receipt.contractAddress;
            })
            .catch (console.log)
        })
        .catch (console.log)
    })
    .catch (console.log)
}



/**
 * This is a more general way to write into the contract, 
 * if the sender's account is not in the wallet.
 * @param {Object} fromAccount web3 account object
 * @param {Object} contract web3 contract object
 * @param {string} funName
 * @param {array} [args=[]] 
 */  
function writeIntoContract (fromAccount, contract, funName, args = []) {
    let data = contract.methods[funName](...args).encodeABI();
    contract.methods[funName](...args)
    .estimateGas( (err, gas) => {
        console.log(gas);
        gas = gas + 210000; //add a little bit more to the estimated Gas
        sendTx (fromAccount, contract.options.address, 0, gas, 0, data)
    })
    .catch (console.log)
}



/**
 * This is a concise way to write into the contract, 
 * if the sender's account is added in the wallet.
 * @param {Object} fromAccount web3 account object
 * @param {Object} contract web3 contract object
 * @param {string} funName
 * @param {array} [args=[]] 
 */   
// function writeIntoContract (fromAccount, contract, funName, args = []) {
//     contract.methods[funName](...args)
//     .estimateGas( (err, gas) => {
//         console.log(gas);
//         gas = gas + 210000; //add a little bit more to the estimated Gas
//         contract.methods[funName](...args)
//         .send({from: fromAccount.address, gas: 50000})
//         .on('transactionHash', hash => {
//             console.log('TX hash: ' + hash);
//         })
//         .on('receipt', receipt => {
//             console.log(receipt);
//         })
//         .on('error', console.error)
//     })
//     .catch (console.log)
// }



/**
 * This is to read the return value from the contract
 * @param {Object} contract web3 contract object
 * @param {string} funName 
 * @param {array} [args=[]] 
 */
function readFromContract (contract, funName, args = []) {    
    contract.methods[funName](...args)
    .call()
    .then(console.log)
}



/**
 * This is a more general way to send transaction asynchronously,
 * if the sender's account is not in the wallet.
 * @param {Object} fromAccount web3 account object
 * @param {string} toAddress web3 account object
 * @param {(BigNumber|number|string)} [value=0]
 * @param {(number|string)} [nonce=0] 
 * @param {(number|string)} [gas=27000] 
 * @param {string} [data='']
 * @returns {Promise} Promise object represents the receipt of the transaction
 */ 
function sendTxAsync (fromAccount, toAddress, value = 0, nonce = 0, gas = 27000, data = '') {
    return new Promise(function(resolve, reject) {
        web3.eth.getTransactionCount(fromAccount.address)
        .then( n => {
            let tx = {
                nonce:    nonce < n ? n : nonce,
                gasPrice: GWEI, 
                gasLimit: gas,
                to:       toAddress, 
                value:    value._isBigNumber ? value : value.toString(),
                data:     data
            }
            web3.eth.accounts.signTransaction(tx, fromAccount.privateKey)
            .then( signedTx => {
                web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on('transactionHash', hash => {
                  console.log('TX hash: ' + hash);
                })
                .on('receipt', receipt => {
                  resolve(receipt);
                })
                .catch( error => reject(error));
            })
            .catch( error => reject(error))
        })
        .catch( error => reject(error))
    });
}



/**
 * This is a more general way to deploy contract asynchronously, 
 * if the sender's account is not in the wallet.
 * @param {Object} fromAccount web3 account object
 * @param {Object} contract web3 contract object
 * @param {array} [args=[]]
 * @param {(BigNumber|number|string)} [value=0]
 * @return {Promise} Promise object represents the receipt of the deployed contract
 */  
function deployContractAsync (fromAccount, contract, args = [], value = 0) {
    return new Promise(function(resolve, reject) {
        contract.deploy({
            data: contract.options.data, 
            arguments: args
        })
        .estimateGas( (err, gas) => {
            console.log(gas);
            gas = gas + 210000; //add a little bit more to the estimated Gas
            sendTxAsync (fromAccount, '', value, 0, gas, contract.options.data)
            .then ( receipt => resolve(receipt) )
            .catch (error => reject (error))
        })
        .catch (error => reject(error))
    })
}



/**
 * This is a more general way to write into the contract asynchronously, 
 * if the sender's account is not in the wallet.
 * @param {Object} fromAccount web3 account object
 * @param {Object} contract web3 contract object
 * @param {string} funName
 * @param {array} [args=[]]
 * @param {(BigNumber|number|string)} [value=0]
 * @returns {Promise} Promise object represents the receipt of the transaction
 */ 
function writeIntoContractAsync (fromAccount, contract, funName, args = [], value = 0) {
    let data = contract.methods[funName](...args).encodeABI();
    return new Promise(function(resolve, reject) {
        contract.methods[funName](...args)
        .estimateGas( (err, gas) => {
            console.log(gas);
            gas = gas + 210000; //add a little bit more to the estimated Gas
            sendTxAsync (fromAccount, contract.options.address, value, 0, gas, data)
            .then ( receipt => resolve(receipt) )
            .catch ( error => reject (error) )
        })
        .catch (error => reject(error))
    })
}



/**
 * This is to read the return value from the contract asynchronously
 * @param {Object} contract web3 contract object
 * @param {string} funName 
 * @returns {Promise} Promise object represents the "reading" from the contract
 */
function readFromContractAsync(contract, funName, args = []) {
    return contract.methods[funName](...args).call();
}
